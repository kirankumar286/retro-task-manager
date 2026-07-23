import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.mark.django_db
class TestAuthenticationAPI:
    def test_user_registration_success(self, api_client):
        url = reverse('auth_register')
        payload = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'StrongPassword123!'
        }
        response = api_client.post(url, payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['username'] == 'newuser'

    def test_user_registration_duplicate_username(self, api_client, user_a):
        url = reverse('auth_register')
        payload = {
            'username': 'usera',
            'email': 'different@example.com',
            'password': 'StrongPassword123!'
        }
        response = api_client.post(url, payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_registration_missing_email(self, api_client):
        url = reverse('auth_register')
        payload = {
            'username': 'noemailuser',
            'password': 'StrongPassword123!'
        }
        response = api_client.post(url, payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_user_login_success(self, api_client, user_a):
        url = reverse('auth_login')
        payload = {
            'username': 'usera',
            'password': 'Password123!'
        }
        response = api_client.post(url, payload)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['username'] == 'usera'

    def test_user_login_invalid_credentials(self, api_client, user_a):
        url = reverse('auth_login')
        payload = {
            'username': 'usera',
            'password': 'WrongPassword!'
        }
        response = api_client.post(url, payload)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_refresh_success(self, api_client, user_a):
        refresh = RefreshToken.for_user(user_a)
        url = reverse('auth_refresh')
        payload = {'refresh': str(refresh)}
        response = api_client.post(url, payload)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
