from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from datetime import datetime, timedelta
from app.models.property import Property, Rental, Expense
from openai import OpenAI
from app.core.config import settings
from threading import Lock

class ChatEngine:
    """Gestor persistente de chat IA por usuario"""

    _instance = None
    _lock = Lock()
    db: Session
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

    
    def generate_insights(self) -> List[Dict]:
        """Genera insights automáticos del portfolio"""
        insights = []
        
        # Total de propiedades
        total_props = self.db.query(func.count(Property.id)).filter(
            Property.user_id == self.user_id
        ).scalar()
        
        insights.append({
            "type": "info",
            "title": "Portfolio",
            "message": f"Tienes {total_props} propiedad{'es' if total_props != 1 else ''} en tu portfolio"
        })
        
        # Ingresos mensuales
        property_ids = [p[0] for p in self.db.query(Property.id).filter(
            Property.user_id == self.user_id
        ).all()]
        
        if property_ids:
            ingresos = self.db.query(func.sum(Rental.monto_mensual)).filter(
                Rental.propiedad_id.in_(property_ids),
                Rental.estado == "activo"
            ).scalar() or 0
            
            insights.append({
                "type": "success",
                "title": "Ingresos Mensuales",
                "message": f"${ingresos:,.2f} en alquileres activos"
            })
        
        return insights