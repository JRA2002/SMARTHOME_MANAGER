from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class RentalBase(BaseModel):
    tenant_name: str
    tenant_email: str
    tenant_phone: Optional[str] = None
    monthly_amount: float = Field(gt=0)
    start_date: datetime
    end_date: Optional[datetime] = None
    deposit: float = Field(ge=0, default=0)

class RentalCreate(RentalBase):
    property_id: int

class RentalResponse(RentalBase):
    id: int
    property_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class RentalUpdate(BaseModel):
    tenant_name: Optional[str] = None
    tenant_email: Optional[str] = None
    tenant_phone: Optional[str] = None
    monthly_amount: Optional[float] = Field(None, gt=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    deposit: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None

class PaginatedRentals(BaseModel):
    success: bool
    data: List[RentalResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True