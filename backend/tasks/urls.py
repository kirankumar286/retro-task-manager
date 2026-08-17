from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, CustomTokenObtainPairView, TaskViewSet, MissionProposalViewSet, AIChatView, UserProfileView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'ai/proposals', MissionProposalViewSet, basename='proposal')

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),

    # Profile Endpoint
    path('users/profile/', UserProfileView.as_view(), name='user_profile'),

    # AI Classify Endpoint
    path('ai/classify/', AIChatView.as_view(), name='ai_classify'),

    # Task Endpoints (managed via router)
    path('', include(router.urls)),
]
