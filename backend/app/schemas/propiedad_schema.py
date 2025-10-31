from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.propiedad import TipoPropiedad, EstadoPropiedad
from app.models.property import PropertyType, PropertyStatus

# Propiedad Schemas
class PropertyBase(BaseModel):
    title: str
    address: str
    property_type: PropertyType
    price: float = Field(gt=0)
    area: float = Field(gt=0)
    bedrooms: int = Field(ge=0)
    bathrooms: int = Field(ge=0)
    description: Optional[str] = None
    image_url: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    address: Optional[str] = None
    property_type: Optional[PropertyType] = None
    price: Optional[float] = Field(None, gt=0)
    area: Optional[float] = Field(None, gt=0)
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    image_url: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: int
    user_id: int
    property_status: PropertyStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Rental Schemas
class RentalBase(BaseModel):
    tenant_name: str
    tenant_email: str
    tenant_phone: Optional[str] = None
    monthly_rent: float = Field(gt=0)
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

# Payment Schemas
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

# Expense Schemas
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

# Pagination
class PaginatedResponse(BaseModel):
    success: bool = True
    data: List
    total: int
    page: int
    page_size: int
    total_pages: int
