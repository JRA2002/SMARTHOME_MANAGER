from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from datetime import datetime, timedelta
from app.models.property import Property, Rental, Expense

class ChatEngine:
    """Motor de chat IA para asistencia en gestión de propiedades"""
    
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
    
    def process_message(self, message: str, history: List[Dict]) -> Dict:
        """
        Procesa un mensaje del usuario y genera respuesta
        
        Args:
            message: Mensaje del usuario
            history: Historial de conversación
            
        Returns:
            Diccionario con respuesta y sugerencias
        """
        message_lower = message.lower()
        
        # Análisis simple de intención (en producción usar NLP/LLM real)
        if any(word in message_lower for word in ['cuántas', 'cuantas', 'número', 'total']):
            if 'propiedad' in message_lower:
                return self._get_property_count()
            elif 'alquiler' in message_lower or 'inquilino' in message_lower:
                return self._get_rental_count()
        
        elif any(word in message_lower for word in ['ingreso', 'ganancia', 'dinero']):
            return self._get_income_summary()
        
        elif any(word in message_lower for word in ['gasto', 'costo']):
            return self._get_expense_summary()
        
        elif any(word in message_lower for word in ['mejor', 'rentable', 'más']):
            return self._get_best_property()
        
        else:
            return {
                "response": "Puedo ayudarte con información sobre tus propiedades, alquileres, ingresos y gastos. ¿Qué te gustaría saber?",
                "suggestions": [
                    "¿Cuántas propiedades tengo?",
                    "¿Cuál es mi ingreso mensual?",
                    "¿Cuáles son mis gastos este mes?",
                    "¿Cuál es mi propiedad más rentable?"
                ]
            }
    
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
