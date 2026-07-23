import pytest
from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError
from tasks.models import Task

@pytest.mark.django_db
class TestTaskModel:
    def test_task_default_values(self, user_a):
        task = Task.objects.create(
            title='Test Task Defaults',
            owner=user_a
        )
        assert task.status == 'todo'
        assert task.priority == 'medium'
        assert task.description == ''
        assert task.due_date is None
        assert str(task) == f"Test Task Defaults [todo] ({user_a.username})"

    def test_empty_title_validation_raises_error(self, user_a):
        task = Task(title='   ', owner=user_a)
        with pytest.raises(ValidationError) as excinfo:
            task.save()
        assert 'title' in excinfo.value.message_dict

    def test_past_due_date_on_creation_raises_error(self, user_a):
        yesterday = timezone.now().date() - timedelta(days=1)
        task = Task(
            title='Past Task',
            due_date=yesterday,
            owner=user_a
        )
        with pytest.raises(ValidationError) as excinfo:
            task.save()
        assert 'due_date' in excinfo.value.message_dict

    def test_future_due_date_on_creation_succeeds(self, user_a):
        tomorrow = timezone.now().date() + timedelta(days=1)
        task = Task(
            title='Future Task',
            due_date=tomorrow,
            owner=user_a
        )
        task.save()
        assert task.pk is not None
        assert task.due_date == tomorrow
