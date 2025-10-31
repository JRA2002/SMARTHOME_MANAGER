from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.ml.predictor import PropertyValuePredictor
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class ValuationRequest(BaseModel):
    address: str
    property_type: str
    area: float = Field(gt=0)
    rooms: int = Field(ge=0)
    bathrooms: int = Field(ge=0)
    age: Optional[int] = Field(None, ge=0)
    location_score: Optional[float] = Field(None, ge=0, le=10)

class ValuationResponse(BaseModel):
    success: bool = True
    estimated_value: float
    minimum_range: float
    maximum_range: float
    confidence: float
    factors: dict

@router.post("/", response_model=ValuationResponse)
@limiter.limit("10/minute")
async def predict_valor(
    request: Request,
    valuation_data: ValuationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Predecir valor de propiedad usando ML"""
    try:
        predictor = PropertyValuePredictor()
        result = predictor.predict(valuation_data.model_dump())
        
        return ValuationResponse(**result)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al predecir valor: {str(e)}"
        )
