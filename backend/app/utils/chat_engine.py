from typing import List, Dict
from openai import OpenAI
from app.core.config import settings
from threading import Lock

class ChatEngine:
    """Gestor persistente de chat IA por usuario"""

    _instance = None
    _lock = Lock()
    user_id: int

    def __new__(cls, *args, **kwargs):
        """Singleton: solo una instancia global"""
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ChatEngine, cls).__new__(cls)
                cls._instance.client = OpenAI(
                    base_url=settings.BASE_URL_API_GROQ,
                    api_key=settings.SECRET_KEY_API_GROQ
                )
        return cls._instance
    
    def process_message(self, message: str, history: List[Dict]) -> Dict:
      
        if message.lower() in ["salir", "exit", "quit", "adiós", "goodbye"]:
            return {"response": "¡Hasta luego!", "suggestions": []}

        history.append({"role": "user", "content": message})

        response = self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=history,
            temperature=0.7,
        )
        ai_message = response.choices[0].message.content
        history.append({"role": "assistant", "content": ai_message})
      
        return {"response": ai_message, "history": history}