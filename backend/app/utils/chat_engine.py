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
    
        
    def _get_property_count(self) -> Dict:
        """Obtiene el conteo de propiedades"""
        count = self.db.query(func.count(Property.id)).filter(
            Property.user_id == self.user_id
        ).scalar()
                
        return {
            "response": f"Actualmente tienes {count} propiedad{'es' if count != 1 else ''} registrada{'s' if count != 1 else ''}.",
            "suggestions": [
            "¿Cuántas están alquiladas?",
            "Muéstrame mis ingresos totales",
            "¿Cuál es la más rentable?"
            ]
        }
    
    def _get_rental_count(self) -> Dict:
        """Obtiene el conteo de alquileres activos"""
        property_ids = [p[0] for p in self.db.query(Property.id).filter(
            Property.user_id == self.user_id
        ).all()]
        
        count = self.db.query(func.count(Rental.id)).filter(
            Rental.propiedad_id.in_(property_ids),
            Rental.estado == "activo"
        ).scalar()
        
        return {
            "response": f"Tienes {count} alquiler{'es' if count != 1 else ''} activo{'s' if count != 1 else ''} en este momento.",
            "suggestions": [
                "¿Cuánto ingreso generan?",
                "Muéstrame los gastos",
                "¿Hay pagos pendientes?"
            ]
        }
    
    def _get_income_summary(self) -> Dict:
        """Obtiene resumen de ingresos"""
        property_ids = [p[0] for p in self.db.query(Property.id).filter(
            Property.user_id == self.user_id
        ).all()]
        
        total_mensual = self.db.query(func.sum(Rental.monto_mensual)).filter(
            Rental.propiedad_id.in_(property_ids),
            Rental.estado == "activo"
        ).scalar() or 0
        
        return {
            "response": f"Tus ingresos mensuales por alquileres son de ${total_mensual:,.2f}. Esto representa un ingreso anual estimado de ${total_mensual * 12:,.2f}.",
            "suggestions": [
                "¿Cuáles son mis gastos?",
                "¿Cuál es mi ganancia neta?",
                "Muéstrame la propiedad más rentable"
            ]
        }
    
    def _get_expense_summary(self) -> Dict:
        """Obtiene resumen de gastos"""
        property_ids = [p[0] for p in self.db.query(Property.id).filter(
            Property.user_id == self.user_id
        ).all()]
        
        # Gastos del último mes
        fecha_inicio = datetime.utcnow() - timedelta(days=30)
        total_gastos = self.db.query(func.sum(Expense.monto)).filter(
            Expense.propiedad_id.in_(property_ids),
            Expense.fecha >= fecha_inicio
        ).scalar() or 0
        
        return {
            "response": f"Tus gastos en los últimos 30 días suman ${total_gastos:,.2f}.",
            "suggestions": [
                "¿Cuáles son mis ingresos?",
                "¿Cuál es mi ganancia neta?",
                "Muéstrame los gastos por categoría"
            ]
        }
    
    def _get_best_property(self) -> Dict:
        """Identifica la propiedad más rentable"""
        # Simplificado - en producción calcular ROI real
        propiedad = self.db.query(Property).filter(
            Property.user_id == self.user_id
        ).order_by(Property.precio.desc()).first()
        
        if not propiedad:
            return {
                "response": "No tienes propiedades registradas aún.",
                "suggestions": ["Agregar nueva propiedad"]
            }
        
        return {
            "response": f"Tu propiedad con mayor valor es '{propiedad.titulo}' ubicada en {propiedad.direccion}, valorada en ${propiedad.precio:,.2f}.",
            "suggestions": [
                "¿Cuánto genera de ingreso?",
                "Muéstrame todos los gastos de esta propiedad",
                "¿Está alquilada actualmente?"
            ]
        }
    
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
