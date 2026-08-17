import pytest
from django.urls import reverse
from rest_framework import status
from tasks.models import Task, MissionProposal

@pytest.fixture(autouse=True)
def mock_empty_api_key(settings):
    settings.GEMINI_API_KEY = ""

@pytest.mark.django_db
class TestAIEndpoints:
    def test_unauthenticated_user_cannot_access_classify(self, api_client):
        url = reverse('ai_classify')
        response = api_client.post(url, {'prompt': 'Buy eggs'})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_classify_simple_task_creation(self, authenticated_client_a, user_a):
        url = reverse('ai_classify')
        payload = {'prompt': 'Buy milk'}
        response = authenticated_client_a.post(url, payload)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['intent'] == 'create_task'
        assert response.data['task']['title'] == 'Buy milk'
        assert response.data['task']['category'] == 'groceries'
        
        # Verify database record
        assert Task.objects.filter(owner=user_a, title='Buy milk').exists()

    def test_classify_simple_task_duplicate_warning(self, authenticated_client_a, user_a):
        # Create an existing active task
        Task.objects.create(owner=user_a, title='Buy eggs', category='groceries', status='todo')
        
        url = reverse('ai_classify')
        payload = {'prompt': 'Buy eggs'}
        
        # Should return duplicate warning status
        response = authenticated_client_a.post(url, payload)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['intent'] == 'duplicate_warning'
        assert response.data['task']['title'] == 'Buy eggs'
        
        # Should create task anyway if forced
        payload['force'] = True
        response_force = authenticated_client_a.post(url, payload)
        assert response_force.status_code == status.HTTP_201_CREATED
        assert Task.objects.filter(owner=user_a, title='Buy eggs').count() == 2

    def test_classify_mission_creates_proposal(self, authenticated_client_a, user_a):
        url = reverse('ai_classify')
        payload = {'prompt': 'Prepare for React exam'}
        response = authenticated_client_a.post(url, payload)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['intent'] == 'create_mission'
        assert 'proposal' in response.data
        assert response.data['proposal']['status'] == 'pending'
        
        # Verify proposal created in database
        assert MissionProposal.objects.filter(owner=user_a, goal='Prepare for React exam').exists()

    def test_approve_proposal_creates_tasks_and_is_idempotent(self, authenticated_client_a, user_a):
        proposal = MissionProposal.objects.create(
            owner=user_a,
            goal='Launch Portfolio',
            original_input='Launch Portfolio',
            proposed_tasks=[
                {'title': 'Finish homepage', 'category': 'work', 'priority': 'high'},
                {'title': 'Deploy to host', 'category': 'work', 'priority': 'medium'}
            ],
            status='pending'
        )
        
        url = reverse('proposal-approve', kwargs={'pk': proposal.id})
        
        # Approve proposal
        response = authenticated_client_a.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'approved'
        
        # Verify actual Tasks are created in database
        assert Task.objects.filter(owner=user_a, title='Finish homepage', category='work').exists()
        assert Task.objects.filter(owner=user_a, title='Deploy to host', category='work').exists()
        
        proposal.refresh_from_db()
        assert proposal.status == 'approved'
        
        # Double approval should fail with 400 Bad Request
        response_double = authenticated_client_a.post(url)
        assert response_double.status_code == status.HTTP_400_BAD_REQUEST

    def test_reject_proposal(self, authenticated_client_a, user_a):
        proposal = MissionProposal.objects.create(
            owner=user_a,
            goal='Prepare React',
            status='pending'
        )
        url = reverse('proposal-reject', kwargs={'pk': proposal.id})
        response = authenticated_client_a.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'rejected'
        
        proposal.refresh_from_db()
        assert proposal.status == 'rejected'
        
        # Verify no actual tasks were created
        assert not Task.objects.filter(owner=user_a, title='Prepare React').exists()

    def test_proposal_isolation_protection(self, authenticated_client_a, user_b):
        # User B's proposal
        proposal_b = MissionProposal.objects.create(
            owner=user_b,
            goal='User B Secret Mission',
            status='pending'
        )
        
        # User A tries to approve User B's proposal -> Should fail (404 Not Found)
        url = reverse('proposal-approve', kwargs={'pk': proposal_b.id})
        response = authenticated_client_a.post(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        proposal_b.refresh_from_db()
        assert proposal_b.status == 'pending'

    def test_completing_task_awards_correct_xp(self, authenticated_client_a, task_user_a, user_a):
        # Initial profile
        profile = user_a.profile
        assert profile.xp == 0
        assert profile.level == 1
        
        # Complete task
        detail_url = reverse('task-detail', kwargs={'pk': task_user_a.id})
        response = authenticated_client_a.patch(detail_url, {'status': 'done'})
        
        assert response.status_code == status.HTTP_200_OK
        # Task user a has priority 'medium' -> should award 25 XP
        assert response.data['xp_awarded'] == 25
        assert response.data['leveled_up'] is False
        
        profile.refresh_from_db()
        assert profile.xp == 25
        
        # Double completion check (idempotency check)
        response_double = authenticated_client_a.patch(detail_url, {'status': 'done'})
        assert response_double.status_code == status.HTTP_200_OK
        assert 'xp_awarded' not in response_double.data
        
        profile.refresh_from_db()
        assert profile.xp == 25
