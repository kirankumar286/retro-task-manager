import django_filters
from django.utils import timezone
from .models import Task

class TaskFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category', lookup_expr='exact')
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')
    priority = django_filters.CharFilter(field_name='priority', lookup_expr='exact')
    due_before = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    due_after = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')

    important = django_filters.BooleanFilter(method='filter_important')
    due_today = django_filters.BooleanFilter(method='filter_due_today')
    overdue = django_filters.BooleanFilter(method='filter_overdue')

    class Meta:
        model = Task
        fields = ['category', 'status', 'priority', 'due_before', 'due_after', 'important', 'due_today', 'overdue']

    def filter_important(self, queryset, name, value):
        if value:
            return queryset.filter(priority__in=['high', 'urgent'])
        return queryset

    def filter_due_today(self, queryset, name, value):
        if value:
            return queryset.filter(due_date=timezone.now().date())
        return queryset

    def filter_overdue(self, queryset, name, value):
        if value:
            return queryset.filter(due_date__lt=timezone.now().date()).exclude(status='done')
        return queryset

