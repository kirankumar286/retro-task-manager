import json
import re
from datetime import datetime

VALID_CATEGORIES = {'work', 'personal', 'groceries', 'errands', 'study', 'health', 'finance', 'home', 'other'}
VALID_PRIORITIES = {'low', 'medium', 'high', 'urgent'}

def validate_date(date_str):
    if not date_str:
        return None
    try:
        # Match YYYY-MM-DD
        if re.match(r'^\d{4}-\d{2}-\d{2}$', str(date_str)):
            datetime.strptime(str(date_str), '%Y-%m-%d')
            return str(date_str)
    except ValueError:
        pass
    return None

def validate_time(time_str):
    if not time_str:
        return None
    try:
        # Match HH:MM
        match = re.match(r'^(\d{2}):(\d{2})(:\d{2})?$', str(time_str))
        if match:
            h, m = int(match.group(1)), int(match.group(2))
            if 0 <= h < 24 and 0 <= m < 60:
                return f"{h:02d}:{m:02d}"
    except ValueError:
        pass
    return None

def clean_task_dict(task_dict):
    """Normalize fields in a single task dictionary."""
    title = str(task_dict.get('title', '')).strip()
    if not title:
        title = "AI Task"
        
    description = str(task_dict.get('description', '')).strip()
    
    category = str(task_dict.get('category', 'other')).lower().strip()
    if category not in VALID_CATEGORIES:
        category = 'other'
        
    priority = str(task_dict.get('priority', 'medium')).lower().strip()
    if priority not in VALID_PRIORITIES:
        priority = 'medium'
        
    due_date = validate_date(task_dict.get('due_date'))
    due_time = validate_time(task_dict.get('due_time'))
    
    return {
        'title': title,
        'description': description,
        'category': category,
        'priority': priority,
        'due_date': due_date,
        'due_time': due_time
    }

def parse_ai_response(raw_text):
    """Parses and validates the raw JSON response from the LLM."""
    # Strip markdown code blocks if any
    cleaned_text = raw_text.strip()
    if cleaned_text.startswith("```"):
        # Match json block
        match = re.search(r'```(?:json)?\s*(.*?)\s*```', cleaned_text, re.DOTALL)
        if match:
            cleaned_text = match.group(1).strip()
            
    try:
        data = json.loads(cleaned_text)
    except Exception as e:
        raise ValueError(f"AI response is not valid JSON: {str(e)}")
        
    intent = str(data.get('intent', 'create_task')).lower().strip()
    if intent not in ('create_task', 'create_mission'):
        intent = 'create_task'
        
    result = {'intent': intent}
    
    if intent == 'create_task':
        task_data = data.get('task')
        if not task_data:
            # Fallback if AI put task keys directly at top level
            task_data = data
        result['task'] = clean_task_dict(task_data)
    else:
        mission_data = data.get('mission', {})
        title = str(mission_data.get('title', 'AI Mission')).strip()
        goal = str(mission_data.get('goal', '')).strip()
        deadline = validate_date(mission_data.get('deadline'))
        
        raw_tasks = mission_data.get('tasks', [])
        tasks = []
        for rt in raw_tasks:
            tasks.append(clean_task_dict(rt))
            
        if not tasks:
            # Fallback task if list is empty
            tasks.append({
                'title': title,
                'description': goal or "Mission task details",
                'category': 'other',
                'priority': 'medium',
                'due_date': deadline,
                'due_time': None
            })
            
        result['mission'] = {
            'title': title,
            'goal': goal,
            'deadline': deadline,
            'tasks': tasks
        }
        
    return result
