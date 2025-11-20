from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.property import PropertyType, PropertyStatus

class PropertyBase(BaseModel):
    title: str
    address: str
    city: str
    type: PropertyType
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
    city: Optional[str] = None
    type: Optional[PropertyType] = None
    price: Optional[float] = Field(None, gt=0)
    area: Optional[float] = Field(None, gt=0)
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    image_url: Optional[str] = None

class PropertyResponse(PropertyBase):
    id: int
    user_id: int
    status: PropertyStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PaginatedProperties(BaseModel):
    success: bool
    data: List[PropertyResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True

class PaginatedResponse(BaseModel):
    success: bool = True
    data: List
    total: int
    page: int
    page_size: int
    total_pages: int