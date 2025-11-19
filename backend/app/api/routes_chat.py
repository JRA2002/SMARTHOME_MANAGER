from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import func
from app.core.intent_detector import detect_intent, Intent
from app.models.property import Property, Rental, Expense
from app.core.database_postgres import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.utils.chat_engine import ChatEngine
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    success: bool = True
    response: str

@router.post("/", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(
    request: Request,
    chat_data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = chat_data.message
    intent = detect_intent(message)
     
    if intent == Intent.INCOME:
        total_income = db.query(func.sum(Rental.monthly_amount))\
            .join(Property, Property.id == Rental.property_id)\
            .filter(Property.user_id == current_user.id).scalar() or 0
        return {"response": f"Tu ingreso mensual total es de ${total_income:.2f}.", "suggestions": []}

    elif intent == Intent.PROPERTY_COUNT:
        total_props = db.query(func.count(Property.id))\
            .filter(Property.user_id == current_user.id).scalar()
        return {"response": f"Tienes {total_props} propiedades registradas.", "suggestions": []}

    elif intent == Intent.TOP_PROPERTY:
        top_rental = db.query(Property.title, func.sum(Rental.monthly_amount).label("total"))\
            .join(Rental, Property.id == Rental.property_id)\
            .filter(Property.user_id == current_user.id)\
            .group_by(Property.title)\
            .order_by(func.sum(Rental.monthly_amount).desc())\
            .first()
        if top_rental:
            return {"response": f"La propiedad más rentable es '{top_rental.title}' con un ingreso de ${top_rental.total:.2f}.", "suggestions": []}
        return {"response": "No hay datos de rentas todavía.", "suggestions": []}

    elif intent == Intent.EXPENSES:
        total_expenses = db.query(func.sum(Expense.amount))\
            .filter(Expense.property_id == current_user.id).scalar() or 0
        return {"response": f"Tus gastos totales registrados son de ${total_expenses:.2f}.", "suggestions": []}
    
    try:
        chat_engine = ChatEngine(db, current_user.id)
        response = chat_engine.process_message(
            chat_data.message,
            chat_data.history
        )
        return response
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en el chat: {str(e)}"
        )

@router.get("/insights", response_model=dict)
@limiter.limit("30/minute")
async def get_insights(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        chat_engine = ChatEngine(db, current_user.id)
        insights = chat_engine.generate_insights()
        
        return {
            "success": True,
            "insights": insights
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar insights: {str(e)}"
        )