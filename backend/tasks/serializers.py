from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Task, MissionProposal, UserProfile, Category

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def validate_username(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Username cannot be empty.")
        if User.objects.filter(username__iexact=value.strip()).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value.strip()

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Email cannot be empty.")
        return value.strip()

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class TaskSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'status', 'priority', 'category', 'due_date', 'due_time', 'owner', 'created_at', 'updated_at')
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty or whitespace only.")
        return value.strip()

    def validate_due_date(self, value):
        if value:
            # Rejection on creation
            if self.instance is None and value < timezone.now().date():
                raise serializers.ValidationError("Due date cannot be in the past on creation.")
        return value

    def validate_category(self, value):
        if not value:
            return 'other'
        request = self.context.get('request')
        if request and request.user:
            from .models import get_user_categories
            valid_keys = get_user_categories(request.user).values_list('key', flat=True)
            if value not in valid_keys and value != 'other':
                return 'other'
        return value

class MissionProposalSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = MissionProposal
        fields = ('id', 'owner', 'goal', 'original_input', 'proposed_tasks', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at')

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    next_level_xp = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ('id', 'username', 'xp', 'level', 'current_streak', 'longest_streak', 'next_level_xp')

    def get_next_level_xp(self, obj):
        next_lvl = obj.level + 1
        return (next_lvl - 1) * 100 + (next_lvl - 2) * (next_lvl - 1) * 25

class CategorySerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Category
        fields = ('id', 'owner', 'name', 'key', 'icon', 'is_pinned', 'created_at')
        read_only_fields = ('id', 'owner', 'key', 'created_at')

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Category name cannot be empty.")
        return value.strip()
