from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Task, MissionProposal, UserProfile, Category, get_user_categories
from .serializers import UserRegistrationSerializer, UserSerializer, TaskSerializer, MissionProposalSerializer, UserProfileSerializer, CategorySerializer
from .permissions import IsOwner
from .filters import TaskFilter
from .ai.classifier import AIClassifier
from .ai.planner import AIPlanner

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens directly upon successful registration
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'User registered successfully.'
        }, status=status.HTTP_201_CREATED)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        # Users only see and interact with their own tasks
        if getattr(self, 'swagger_fake_view', False):
            return Task.objects.none()
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        new_status = task.status
        
        xp_awarded = 0
        leveled_up = False
        if new_status == 'done' and old_status != 'done':
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            xp_awarded, leveled_up = profile.award_xp_for_task(task)
            
        data = serializer.data
        if xp_awarded > 0:
            data['xp_awarded'] = xp_awarded
            data['leveled_up'] = leveled_up
            
        return Response(data)

from rest_framework.decorators import action

class MissionProposalViewSet(viewsets.ModelViewSet):
    serializer_class = MissionProposalSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return MissionProposal.objects.none()
        return MissionProposal.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        proposal = self.get_object()
        
        # Idempotency validation
        if proposal.status != 'pending':
            return Response({
                'detail': f'Proposal has already been {proposal.status}.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # Mark as approved
        proposal.status = 'approved'
        proposal.save()
        
        created_tasks = []
        for task_info in proposal.proposed_tasks:
            # Create actual tasks in the database
            category_slug = task_info.get('category', 'other')
            if not Category.objects.filter(owner=request.user, key=category_slug).exists():
                category_slug = 'other'
            task = Task.objects.create(
                owner=request.user,
                title=task_info.get('title', 'AI Subtask'),
                description=task_info.get('description', ''),
                category=category_slug,
                priority=task_info.get('priority', 'medium'),
                status='todo',
                due_date=task_info.get('due_date'),
                due_time=task_info.get('due_time')
            )
            created_tasks.append(TaskSerializer(task).data)
            
        return Response({
            'status': 'approved',
            'tasks': created_tasks,
            'message': 'Mission tasks generated successfully.'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        proposal = self.get_object()
        
        if proposal.status != 'pending':
            return Response({
                'detail': f'Proposal has already been {proposal.status}.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        proposal.status = 'rejected'
        proposal.save()
        return Response({
            'status': 'rejected',
            'message': 'Mission proposal rejected.'
        }, status=status.HTTP_200_OK)

class AIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt', '').strip()
        force = request.data.get('force', False)
        
        if not prompt:
            return Response({'detail': 'Prompt is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Call AI service via classifier
        intent, ai_data = AIClassifier.classify_intent(prompt, user=request.user)
        
        if intent == 'create_task':
            task_info = ai_data.get('task', {})
            title = task_info.get('title', '').strip()
            
            # Duplicate check
            existing_active_task = Task.objects.filter(
                owner=request.user,
                title__iexact=title
            ).exclude(status='done').first()
            
            if existing_active_task and not force:
                return Response({
                    'intent': 'duplicate_warning',
                    'task': task_info
                }, status=status.HTTP_200_OK)
                
            # Create task directly
            category_slug = task_info.get('category', 'other')
            if not Category.objects.filter(owner=request.user, key=category_slug).exists():
                category_slug = 'other'
            task = Task.objects.create(
                owner=request.user,
                title=title,
                description=task_info.get('description', ''),
                category=category_slug,
                priority=task_info.get('priority', 'medium'),
                status='todo',
                due_date=task_info.get('due_date'),
                due_time=task_info.get('due_time')
            )
            return Response({
                'intent': 'create_task',
                'task': TaskSerializer(task).data
            }, status=status.HTTP_201_CREATED)
            
        elif intent == 'create_mission':
            mission_info = ai_data.get('mission', {})
            
            # Create MissionProposal
            proposal = MissionProposal.objects.create(
                owner=request.user,
                goal=mission_info.get('goal', prompt),
                original_input=prompt,
                proposed_tasks=mission_info.get('tasks', []),
                status='pending'
            )
            
            # Auto-approval check based on settings
            if hasattr(request.user, 'profile') and request.user.profile.auto_approve_proposals:
                proposal.status = 'approved'
                proposal.save()
                for task_info in proposal.proposed_tasks:
                    category_slug = task_info.get('category', 'other')
                    if not Category.objects.filter(owner=request.user, key=category_slug).exists():
                        category_slug = 'other'
                    Task.objects.create(
                        owner=request.user,
                        title=task_info.get('title', 'AI Subtask'),
                        description=task_info.get('description', ''),
                        category=category_slug,
                        priority=task_info.get('priority', 'medium'),
                        status='todo',
                        due_date=task_info.get('due_date'),
                        due_time=task_info.get('due_time')
                    )
                return Response({
                    'intent': 'create_mission_auto_approved',
                    'proposal': MissionProposalSerializer(proposal).data,
                    'message': 'Mission proposal auto-approved and subtasks created.'
                }, status=status.HTTP_201_CREATED)
                
            return Response({
                'intent': 'create_mission',
                'proposal': MissionProposalSerializer(proposal).data
            }, status=status.HTTP_201_CREATED)
            
        return Response({'detail': 'Invalid AI intent determined.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        return Response(UserProfileSerializer(profile).data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Category.objects.none()
        get_user_categories(self.request.user)
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.key == 'other':
            return Response(
                {"detail": "SYSTEM_ERROR: The 'other' category cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )
        Task.objects.filter(owner=request.user, category=instance.key).update(category='other')
        return super().destroy(request, *args, **kwargs)
