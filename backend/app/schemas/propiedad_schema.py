from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.propiedad import TipoPropiedad, EstadoPropiedad

# Propiedad Schemas
class PropiedadBase(BaseModel):
    titulo: str
    direccion: str
    tipo: TipoPropiedad
    precio: float = Field(gt=0)
    area: float = Field(gt=0)
    habitaciones: int = Field(ge=0)
    banos: int = Field(ge=0)
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None

class PropiedadCreate(PropiedadBase):
    pass

class PropiedadUpdate(BaseModel):
    titulo: Optional[str] = None
    direccion: Optional[str] = None
    tipo: Optional[TipoPropiedad] = None
    estado: Optional[EstadoPropiedad] = None
    precio: Optional[float] = Field(None, gt=0)
    area: Optional[float] = Field(None, gt=0)
    habitaciones: Optional[int] = Field(None, ge=0)
    banos: Optional[int] = Field(None, ge=0)
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None

class PropiedadResponse(PropiedadBase):
    id: int
    user_id: int
    estado: EstadoPropiedad
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Alquiler Schemas
class AlquilerBase(BaseModel):
    inquilino_nombre: str
    inquilino_email: str
    inquilino_telefono: Optional[str] = None
    monto_mensual: float = Field(gt=0)
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    deposito: float = Field(ge=0, default=0)

class AlquilerCreate(AlquilerBase):
    propiedad_id: int

class AlquilerResponse(AlquilerBase):
    id: int
    propiedad_id: int
    estado: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Pago Schemas
class PagoBase(BaseModel):
    monto: float = Field(gt=0)
    fecha_pago: datetime
    metodo_pago: Optional[str] = None
    notas: Optional[str] = None

class PagoCreate(PagoBase):
    alquiler_id: int

class PagoResponse(PagoBase):
    id: int
    alquiler_id: int
    estado: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Gasto Schemas
class GastoBase(BaseModel):
    categoria: str
    descripcion: str
    monto: float = Field(gt=0)
    fecha: datetime
    recibo_url: Optional[str] = None

class GastoCreate(GastoBase):
    propiedad_id: int

class GastoResponse(GastoBase):
    id: int
    propiedad_id: int
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
