from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.core.intent_detector import detect_intent, Intent
from app.models.property import Property, Rental, Expense
from app.core.database_postgres import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.utils.chat_engine import ChatEngine
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.schemas.chat_schema import ChatRequest, ChatResponse

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat(
    request: Request,
    chat_data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    message = chat_data.message
    intent = detect_intent(message)
     
    if intent == Intent.INCOME:
        total_income_result = await db.execute(
                        select(func.sum(Rental.monthly_amount))
                        .join(Property, Property.id == Rental.property_id)
                        .filter(Property.user_id == current_user.id)
                        )
        total_income = total_income_result.scalar() or 0
        return {"response": f"Tu ingreso mensual total es de ${total_income:.2f}.", "suggestions": []}

    elif intent == Intent.PROPERTY_COUNT:
        total_props_result = await db.execute(
            select(func.count(Property.id))
            .filter(Property.user_id == current_user.id)
        )
        total_props = total_props_result.scalar() or 0
        return {"response": f"Tienes {total_props} propiedades registradas.", "suggestions": []}

    elif intent == Intent.TOP_PROPERTY:
        top_rental_result = await db.execute(
            select(Property.title, func.sum(Rental.monthly_amount))
            .join(Rental, Property.id == Rental.property_id)
            .filter(Property.user_id == current_user.id)
            .group_by(Property.title)
            .order_by(func.sum(Rental.monthly_amount).desc())
            .limit(1)
        )
        top_rental = top_rental_result.scalars().first()
        if top_rental:
            return {"response": f"La propiedad más rentable es '{top_rental.title}' con un ingreso de ${top_rental.total:.2f}.", "suggestions": []}
        return {"response": "No hay datos de rentas todavía.", "suggestions": []}

    elif intent == Intent.EXPENSES:
        total_expenses_result = await db.execute(
            select(func.sum(Expense.amount))
            .filter(Expense.property_id == current_user.id)
        )
        total_expenses = total_expenses_result.scalar() or 0
        return {"response": f"Tus gastos totales registrados son de ${total_expenses:.2f}.", "suggestions": []}
    
    try:
        chat_engine = ChatEngine(current_user.id)
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