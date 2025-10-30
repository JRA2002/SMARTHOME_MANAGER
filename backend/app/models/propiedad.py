from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base

class TipoPropiedad(str, enum.Enum):
    CASA = "casa"
    APARTAMENTO = "apartamento"
    OFICINA = "oficina"
    LOCAL = "local"
    TERRENO = "terreno"

class EstadoPropiedad(str, enum.Enum):
    DISPONIBLE = "disponible"
    ALQUILADA = "alquilada"
    MANTENIMIENTO = "mantenimiento"
    VENDIDA = "vendida"

class Propiedad(Base):
    __tablename__ = "propiedades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(String, nullable=False)
    direccion = Column(String, nullable=False)
    tipo = Column(SQLEnum(TipoPropiedad), nullable=False)
    estado = Column(SQLEnum(EstadoPropiedad), default=EstadoPropiedad.DISPONIBLE)
    precio = Column(Float, nullable=False)
    area = Column(Float, nullable=False)
    habitaciones = Column(Integer, default=0)
    banos = Column(Integer, default=0)
    descripcion = Column(String)
    imagen_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    alquileres = relationship("Alquiler", back_populates="propiedad")
    gastos = relationship("Gasto", back_populates="propiedad")

class Alquiler(Base):
    __tablename__ = "alquileres"
    
    id = Column(Integer, primary_key=True, index=True)
    propiedad_id = Column(Integer, ForeignKey("propiedades.id"), nullable=False)
    inquilino_nombre = Column(String, nullable=False)
    inquilino_email = Column(String, nullable=False)
    inquilino_telefono = Column(String)
    monto_mensual = Column(Float, nullable=False)
    fecha_inicio = Column(DateTime, nullable=False)
    fecha_fin = Column(DateTime)
    deposito = Column(Float, default=0)
    estado = Column(String, default="activo")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    propiedad = relationship("Propiedad", back_populates="alquileres")
    pagos = relationship("Pago", back_populates="alquiler")

class Pago(Base):
    __tablename__ = "pagos"
    
    id = Column(Integer, primary_key=True, index=True)
    alquiler_id = Column(Integer, ForeignKey("alquileres.id"), nullable=False)
    monto = Column(Float, nullable=False)
    fecha_pago = Column(DateTime, nullable=False)
    metodo_pago = Column(String)
    estado = Column(String, default="completado")
    notas = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    alquiler = relationship("Alquiler", back_populates="pagos")

class Gasto(Base):
    __tablename__ = "gastos"
    
    id = Column(Integer, primary_key=True, index=True)
    propiedad_id = Column(Integer, ForeignKey("propiedades.id"), nullable=False)
    categoria = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    monto = Column(Float, nullable=False)
    fecha = Column(DateTime, nullable=False)
    recibo_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    propiedad = relationship("Propiedad", back_populates="gastos")
