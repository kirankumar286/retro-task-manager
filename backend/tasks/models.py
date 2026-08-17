from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone

class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    CATEGORY_CHOICES = [
        ('work', 'Work'),
        ('personal', 'Personal'),
        ('groceries', 'Groceries'),
        ('errands', 'Errands'),
        ('study', 'Study'),
        ('health', 'Health'),
        ('finance', 'Finance'),
        ('home', 'Home'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    category = models.CharField(max_length=50, default='other')
    due_date = models.DateField(null=True, blank=True)
    due_time = models.TimeField(null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    mission_proposal = models.ForeignKey('MissionProposal', on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        super().clean()
        # Reject empty or whitespace-only titles
        if self.title is not None and not self.title.strip():
            raise ValidationError({'title': 'Title cannot be empty or blank.'})

        # Reject past due_date on task creation
        if self.pk is None and self.due_date:
            if self.due_date < timezone.now().date():
                raise ValidationError({'due_date': 'Due date cannot be in the past on creation.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} [{self.status}] ({self.owner.username})"

class MissionProposal(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mission_proposals')
    goal = models.TextField(blank=True, default='')
    original_input = models.TextField(blank=True, default='')
    proposed_tasks = models.JSONField(default=list)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Proposal: {self.goal[:30]}... [{self.status}] ({self.owner.username})"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_completion_date = models.DateField(null=True, blank=True)
    ai_model = models.CharField(max_length=50, default='gemini-3.5-flash')
    auto_approve_proposals = models.BooleanField(default=False)

    def calculate_level(self):
        xp = self.xp
        level = 1
        while True:
            next_level = level + 1
            threshold = (next_level - 1) * 100 + (next_level - 2) * (next_level - 1) * 25
            if xp >= threshold:
                level = next_level
            else:
                break
        return level

    def award_xp_for_task(self, task):
        # Verify if XP event already exists for this task to avoid duplicates
        if XPEvent.objects.filter(user=self.user, related_task=task).exists():
            return 0, False
            
        # Determine XP amount
        xp_amounts = {
            'low': 10,
            'medium': 25,
            'high': 50,
            'urgent': 75
        }
        amount = xp_amounts.get(task.priority, 25)
        
        # Create XP event
        XPEvent.objects.create(
            user=self.user,
            amount=amount,
            reason=f"Completed Task: {task.title}",
            related_task=task
        )
        
        # Update user profile
        self.xp += amount
        
        # Check level up
        old_level = self.level
        new_level = self.calculate_level()
        leveled_up = new_level > old_level
        self.level = new_level
        
        # Update Streak
        from django.utils import timezone
        today = timezone.now().date()
        if self.last_completion_date != today:
            if self.last_completion_date == today - timezone.timedelta(days=1):
                self.current_streak += 1
            elif self.last_completion_date is None or self.last_completion_date < today - timezone.timedelta(days=1):
                self.current_streak = 1
                
            if self.current_streak > self.longest_streak:
                self.longest_streak = self.current_streak
                
            self.last_completion_date = today
            
        self.save()
        
        # Check if this task is part of a MissionProposal
        # and if completing it completes the whole mission!
        mission_leveled_up = False
        if task.mission_proposal:
            # Check if all other tasks in this mission are completed
            all_done = not task.mission_proposal.tasks.exclude(status='done').exists()
            if all_done:
                # Award mission completion bonus!
                _, mission_leveled_up = self.award_xp_for_mission(task.mission_proposal)
                
        return amount, (leveled_up or mission_leveled_up)

    def award_xp_for_mission(self, proposal):
        # Prevent duplicate mission XP
        if XPEvent.objects.filter(user=self.user, reason=f"Completed Mission: {proposal.goal}").exists():
            return 0, False
            
        amount = 250
        XPEvent.objects.create(
            user=self.user,
            amount=amount,
            reason=f"Completed Mission: {proposal.goal}"
        )
        self.xp += amount
        old_level = self.level
        new_level = self.calculate_level()
        leveled_up = new_level > old_level
        self.level = new_level
        self.save()
        return amount, leveled_up

    def __str__(self):
        return f"{self.user.username} Profile [Lvl {self.level}] ({self.xp} XP)"

class XPEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='xp_events')
    amount = models.IntegerField()
    reason = models.CharField(max_length=255)
    related_task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='xp_events')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} {self.amount:+} XP: {self.reason}"

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)
    else:
        instance.profile.save()

from django.utils.text import slugify

class Category(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=50)
    key = models.SlugField(max_length=50)
    icon = models.CharField(max_length=10, default='📦')
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_pinned', 'name']
        unique_together = ('owner', 'key')

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.key}) - Pinned: {self.is_pinned} (Owner: {self.owner.username})"

def get_user_categories(user):
    categories = Category.objects.filter(owner=user)
    if not categories.exists():
        # Initialize default categories (groceries and errands merged into groceries)
        defaults = [
            {'key': 'work', 'name': 'Work', 'icon': '💼'},
            {'key': 'personal', 'name': 'Personal', 'icon': '👤'},
            {'key': 'groceries', 'name': 'Groceries', 'icon': '🛒'},
            {'key': 'study', 'name': 'Study', 'icon': '📚'},
            {'key': 'health', 'name': 'Health', 'icon': '❤️'},
            {'key': 'finance', 'name': 'Finance', 'icon': '💰'},
            {'key': 'home', 'name': 'Home', 'icon': '🏠'},
            {'key': 'other', 'name': 'Other', 'icon': '📦'},
        ]
        Category.objects.bulk_create([
            Category(owner=user, key=item['key'], name=item['name'], icon=item['icon'])
            for item in defaults
        ])
        categories = Category.objects.filter(owner=user)
    return categories
