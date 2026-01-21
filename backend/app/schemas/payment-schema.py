from datetime import datetime, timezone
from pydantic import BaseModel, Field, validator
from typing import Optional

class PaymentBase(BaseModel):
    amount: float = Field(gt=0)
    payment_date: datetime
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class PaymentCreate(PaymentBase):
    rental_id: int

class PaymentResponse(PaymentBase):
    id: int
    rental_id: int
    status: str
    created_at: datetime
    
    @validator("created_at")
    def ensure_timezone(cls, v: datetime):
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)
    
    class Config:
        from_attributes = True