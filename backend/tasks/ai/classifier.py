from .service import AIService

class AIClassifier:
    @staticmethod
    def classify_intent(user_input, user_timezone='UTC', user=None):
        """Classifies the user input intent using the AI service."""
        result = AIService.analyze_input(user_input, user_timezone, user)
        return result.get('intent', 'create_task'), result
