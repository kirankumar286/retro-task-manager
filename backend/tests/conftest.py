import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from tasks.models import Task

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user_a(db):
    return User.objects.create_user(
        username='usera',
        email='usera@example.com',
        password='Password123!'
    )

@pytest.fixture
def user_b(db):
    return User.objects.create_user(
        username='userb',
        email='userb@example.com',
        password='Password123!'
    )

@pytest.fixture
def authenticated_client_a(api_client, user_a):
    refresh = RefreshToken.for_user(user_a)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client

@pytest.fixture
def authenticated_client_b(api_client, user_b):
    refresh = RefreshToken.for_user(user_b)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client

@pytest.fixture
def task_user_a(db, user_a):
    return Task.objects.create(
        title='User A Task',
        description='Description A',
        status='todo',
        priority='medium',
        owner=user_a
    )

@pytest.fixture
def task_user_b(db, user_b):
    return Task.objects.create(
        title='User B Task',
        description='Description B',
        status='in_progress',
        priority='high',
        owner=user_b
    )
