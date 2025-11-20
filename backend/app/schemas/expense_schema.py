from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ExpenseBase(BaseModel):
    category: str
    description: str
    amount: float = Field(gt=0)
    date: datetime
    receipt_url: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    property_id: int

class ExpenseResponse(ExpenseBase):
    id: int
    property_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaginatedExpenses(BaseModel):
    success: bool
    data: List[ExpenseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True

class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    date: Optional[datetime] = None
    receipt_url: Optional[str] = None