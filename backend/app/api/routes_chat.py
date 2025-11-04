from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
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
    try:
        chat_engine = ChatEngine()
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
    """Obtener insights automáticos del portfolio"""
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
