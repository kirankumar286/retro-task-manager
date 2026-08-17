from .service import AIService

class AIPlanner:
    @staticmethod
    def plan_mission(user_input, user_timezone='UTC'):
        """Plans the subtasks for a mission using the AI service."""
        result = AIService.analyze_input(user_input, user_timezone)
        return result.get('mission', {})
