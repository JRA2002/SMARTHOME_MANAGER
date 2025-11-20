from datetime import datetime
from pydantic import BaseModel, Field
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
    
    class Config:
        from_attributes = True