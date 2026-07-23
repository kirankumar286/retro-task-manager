import pytest
from datetime import timedelta
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from tasks.models import Task

@pytest.mark.django_db
class TestTaskAPI:
    def test_unauthenticated_request_returns_401(self, api_client):
        url = reverse('task-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_task_happy_path(self, authenticated_client_a, user_a):
        url = reverse('task-list')
        tomorrow = (timezone.now().date() + timedelta(days=1)).isoformat()
        payload = {
            'title': 'New Test Task',
            'description': 'Task details here',
            'status': 'todo',
            'priority': 'high',
            'due_date': tomorrow
        }
        response = authenticated_client_a.post(url, payload)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'New Test Task'
        assert response.data['owner'] == user_a.username
        assert response.data['due_date'] == tomorrow

    def test_create_task_empty_title_returns_400(self, authenticated_client_a):
        url = reverse('task-list')
        payload = {'title': '   ', 'status': 'todo'}
        response = authenticated_client_a.post(url, payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'title' in response.data

    def test_create_task_past_due_date_returns_400(self, authenticated_client_a):
        url = reverse('task-list')
        yesterday = (timezone.now().date() - timedelta(days=1)).isoformat()
        payload = {'title': 'Expired Task', 'due_date': yesterday}
        response = authenticated_client_a.post(url, payload)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'due_date' in response.data

    def test_list_tasks_only_returns_own_tasks(self, authenticated_client_a, task_user_a, task_user_b):
        url = reverse('task-list')
        response = authenticated_client_a.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.data['results'] if isinstance(response.data, dict) and 'results' in response.data else response.data
        assert len(results) == 1
        assert results[0]['id'] == task_user_a.id
        assert results[0]['title'] == 'User A Task'

    def test_user_a_cannot_touch_user_b_task_explicit_isolation(
        self, authenticated_client_a, task_user_b
    ):
        """Explicitly test permission denial & data isolation: User A cannot read, edit, or delete User B's task."""
        detail_url = reverse('task-detail', kwargs={'pk': task_user_b.id})
        
        # 1. GET User B's task -> 404 (or 403)
        get_res = authenticated_client_a.get(detail_url)
        assert get_res.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

        # 2. PUT User B's task -> 404 (or 403)
        put_res = authenticated_client_a.put(detail_url, {'title': 'Hacked Title', 'status': 'done'})
        assert put_res.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

        # 3. PATCH User B's task -> 404 (or 403)
        patch_res = authenticated_client_a.patch(detail_url, {'status': 'done'})
        assert patch_res.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

        # 4. DELETE User B's task -> 404 (or 403)
        del_res = authenticated_client_a.delete(detail_url)
        assert del_res.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN]

        # Verify task is unchanged in database
        task_user_b.refresh_from_db()
        assert task_user_b.title == 'User B Task'

    def test_update_task_happy_path(self, authenticated_client_a, task_user_a):
        detail_url = reverse('task-detail', kwargs={'pk': task_user_a.id})
        payload = {'title': 'Updated User A Task', 'status': 'done', 'priority': 'low'}
        response = authenticated_client_a.put(detail_url, payload)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated User A Task'
        assert response.data['status'] == 'done'

    def test_delete_task_happy_path(self, authenticated_client_a, task_user_a):
        detail_url = reverse('task-detail', kwargs={'pk': task_user_a.id})
        response = authenticated_client_a.delete(detail_url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Task.objects.filter(id=task_user_a.id).exists()

    def test_filtering_searching_and_ordering(self, authenticated_client_a, user_a):
        # Create multiple tasks for user A
        Task.objects.create(title='Alpha Task Bug', status='todo', priority='high', owner=user_a)
        Task.objects.create(title='Beta Feature', status='in_progress', priority='low', owner=user_a)
        Task.objects.create(title='Gamma Bug fix', status='done', priority='medium', owner=user_a)

        url = reverse('task-list')

        # Helper to extract list from response
        def get_list(res):
            return res.data['results'] if isinstance(res.data, dict) and 'results' in res.data else res.data

        # Filter by status
        res_status = authenticated_client_a.get(f"{url}?status=done")
        results = get_list(res_status)
        assert len(results) == 1
        assert results[0]['title'] == 'Gamma Bug fix'

        # Filter by search term
        res_search = authenticated_client_a.get(f"{url}?search=Bug")
        results_search = get_list(res_search)
        assert len(results_search) == 2

        # Filter by priority
        res_prio = authenticated_client_a.get(f"{url}?priority=high")
        results_prio = get_list(res_prio)
        assert len(results_prio) == 1
        assert results_prio[0]['title'] == 'Alpha Task Bug'

