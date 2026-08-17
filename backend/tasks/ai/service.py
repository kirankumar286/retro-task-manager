import os
import requests
from django.conf import settings
from django.utils import timezone
from .prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from .parser import parse_ai_response

class AIService:
    @staticmethod
    def get_api_key():
        # Get GEMINI_API_KEY from environment or django settings
        return getattr(settings, 'GEMINI_API_KEY', os.getenv('GEMINI_API_KEY', ''))

    @classmethod
    def analyze_input(cls, user_input, user_timezone='UTC', user=None):
        """Sends the user input to Gemini API or runs heuristic fallback if offline/no key."""
        api_key = cls.get_api_key()
        
        # Get current date/time context for relative date parsing
        now = timezone.now()
        current_reference = now.strftime('%A, %Y-%m-%d %H:%M') + f" ({user_timezone})"
        
        if not api_key:
            # Fallback to local heuristic parser if API key is not configured
            return cls.fallback_heuristic_parser(user_input, now)
            
        # Dynamic AI model routing based on user profile settings
        model_name = 'gemini-3.5-flash'
        if user and hasattr(user, 'profile'):
            model_name = user.profile.ai_model
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        
        # Construct system prompt with date context
        sys_prompt = SYSTEM_PROMPT.replace('{current_reference}', current_reference)
        user_prompt = USER_PROMPT_TEMPLATE.replace('{user_input}', user_input)
        
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": sys_prompt + "\n" + user_prompt}]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=4)
            response.raise_for_status()
            res_data = response.json()
            
            # Extract content from response
            candidates = res_data.get('candidates', [])
            if candidates:
                parts = candidates[0].get('content', {}).get('parts', [])
                if parts:
                    raw_text = parts[0].get('text', '')
                    return parse_ai_response(raw_text)
                    
            raise ValueError("No output text received from Gemini API.")
            
        except Exception as e:
            # Fallback to heuristic parser on API error to guarantee availability
            return cls.fallback_heuristic_parser(user_input, now)

    @classmethod
    def fallback_heuristic_parser(cls, user_input, reference_dt):
        """A rule-based parser that handles basic scenarios without requiring API keys."""
        input_lower = user_input.lower()
        date_str = reference_dt.date().isoformat()
        
        # Determine intent: search for common mission keywords
        is_mission = any(word in input_lower for word in ['exam', 'prepare', 'launch', 'portfolio', 'mission', 'project', 'plan', 'trip'])
        
        # Infer category
        category = 'other'
        if any(w in input_lower for w in ['ppt', 'presentation', 'report', 'client', 'work', 'timesheet', 'meeting']):
            category = 'work'
        elif any(w in input_lower for w in ['egg', 'milk', 'groceries', 'buy', 'shop', 'food']):
            category = 'groceries'
        elif any(w in input_lower for w in ['parcel', 'security', 'pick up', 'collect', 'errand']):
            category = 'errands'
        elif any(w in input_lower for w in ['study', 'exam', 'read', 'class', 'course', 'learn']):
            category = 'study'
        elif any(w in input_lower for w in ['doctor', 'dentist', 'health', 'appointment', 'run', 'gym', 'workout']):
            category = 'health'
        elif any(w in input_lower for w in ['pay', 'bill', 'finance', 'electricity', 'tax', 'money']):
            category = 'finance'
        elif any(w in input_lower for w in ['clean', 'bedroom', 'home', 'house', 'wash', 'repair']):
            category = 'home'
        elif any(w in input_lower for w in ['movie', 'personal', 'watch', 'play', 'game']):
            category = 'personal'
            
        # Infer priority
        priority = 'medium'
        if any(w in input_lower for w in ['urgent', 'asap', 'now']):
            priority = 'urgent'
        elif any(w in input_lower for w in ['important', 'critical', 'high']):
            priority = 'high'
        elif any(w in input_lower for w in ['sometime', 'low', 'maybe']):
            priority = 'low'
            
        # Infer deadline time
        due_time = None
        if '4 pm' in input_lower or '16:00' in input_lower:
            due_time = '16:00'
        elif '10 am' in input_lower or '10:00' in input_lower:
            due_time = '10:00'
            
        if is_mission:
            # Generate subtasks based on user input
            title = user_input.replace("I need to", "").replace("i need to", "").replace("launch", "Launch").replace("prepare for", "Prepare for").strip()
            title = title[0].upper() + title[1:] if title else "AI Mission"
            
            subtasks = [
                {
                    'title': f"Analyze requirements for {title}",
                    'description': "Step 1 details",
                    'category': category,
                    'priority': 'high',
                    'due_date': date_str,
                    'due_time': None
                },
                {
                    'title': f"Draft initial outline",
                    'description': "Step 2 details",
                    'category': category,
                    'priority': 'medium',
                    'due_date': date_str,
                    'due_time': None
                },
                {
                    'title': f"Finalize and deploy",
                    'description': "Step 3 details",
                    'category': category,
                    'priority': priority,
                    'due_date': date_str,
                    'due_time': due_time
                }
            ]
            
            return {
                'intent': 'create_mission',
                'mission': {
                    'title': title,
                    'goal': user_input,
                    'deadline': date_str,
                    'tasks': subtasks
                }
            }
        else:
            title = user_input.replace("I need to", "").replace("i need to", "").strip()
            title = title[0].upper() + title[1:] if title else "AI Task"
            return {
                'intent': 'create_task',
                'task': {
                    'title': title,
                    'description': '',
                    'category': category,
                    'priority': priority,
                    'due_date': date_str,
                    'due_time': due_time
                }
            }
