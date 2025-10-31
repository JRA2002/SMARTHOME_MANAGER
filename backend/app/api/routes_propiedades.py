from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import (
    get_current_user,
    get_password_hash,
    verify_password,
    create_access_token
)
from app.models.user import User
from app.models.propiedad import Propiedad, Alquiler, Pago, Gasto
from app.schemas.user_schema import UsuarioCreate, UsuarioLogin, UsuarioResponse, Token
from app.schemas.propiedad_schema import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    RentalResponse,
    RentalCreate,
    ExpenseCreate,
    ExpenseResponse
)
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# ============= AUTH ENDPOINTS =============

@router.post("/auth/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    user_data: UsuarioCreate,
    db: Session = Depends(get_db)
):
    """Registrar nuevo usuario"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        fullname=user_data.fullname,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/auth/login", response_model=Token)
@limiter.limit("10/minute")
async def login(
    request: Request,
    credentials: UsuarioLogin,
    db: Session = Depends(get_db)
):
    """Iniciar sesión"""
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inactivo"
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me", response_model=UsuarioResponse)
@limiter.limit("30/minute")
async def get_current_user_info(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Obtener información del usuario actual"""
    return current_user

# ============= PROPIEDADES ENDPOINTS =============

@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_propiedad(
    request: Request,
    propiedad_data: PropertyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear nueva propiedad"""
    nueva_propiedad = Propiedad(
        **propiedad_data.model_dump(),
        user_id=current_user.id
    )
    
    db.add(nueva_propiedad)
    db.commit()
    db.refresh(nueva_propiedad)
    
    return nueva_propiedad

@router.get("/", response_model=dict)
@limiter.limit("60/minute")
async def get_propiedades(
    request: Request,
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(10, ge=1, le=100, description="Número de registros a retornar"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener propiedades del usuario con paginación"""
    # Get total count
    total = db.query(func.count(Propiedad.id)).filter(
        Propiedad.user_id == current_user.id
    ).scalar()
    
    # Get paginated results
    propiedades = db.query(Propiedad).filter(
        Propiedad.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "success": True,
        "data": propiedades,
        "total": total,
        "page": (skip // limit) + 1,
        "page_size": limit,
        "total_pages": total_pages
    }

@router.get("/{propiedad_id}", response_model=PropertyResponse)
@limiter.limit("60/minute")
async def get_propiedad(
    request: Request,
    propiedad_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener propiedad por ID"""
    propiedad = db.query(Propiedad).filter(
        Propiedad.id == propiedad_id,
        Propiedad.user_id == current_user.id
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    return propiedad

@router.put("/{propiedad_id}", response_model=PropertyResponse)
@limiter.limit("30/minute")
async def update_propiedad(
    request: Request,
    propiedad_id: int,
    propiedad_data: PropertyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Actualizar propiedad"""
    propiedad = db.query(Propiedad).filter(
        Propiedad.id == propiedad_id,
        Propiedad.user_id == current_user.id
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    # Update only provided fields
    update_data = propiedad_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(propiedad, field, value)
    
    propiedad.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(propiedad)
    
    return propiedad

@router.delete("/{propiedad_id}", status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")
async def delete_propiedad(
    request: Request,
    propiedad_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Eliminar propiedad"""
    propiedad = db.query(Propiedad).filter(
        Propiedad.id == propiedad_id,
        Propiedad.user_id == current_user.id
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    db.delete(propiedad)
    db.commit()
    
    return {
        "success": True,
        "message": "Propiedad eliminada exitosamente"
    }

# ============= ALQUILERES ENDPOINTS =============

@router.post("/alquileres", response_model=RentalResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_alquiler(
    request: Request,
    alquiler_data: RentalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear nuevo alquiler"""
    # Verify property belongs to user
    propiedad = db.query(Propiedad).filter(
        Propiedad.id == alquiler_data.propiedad_id,
        Propiedad.user_id == current_user.id
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    nuevo_alquiler = Alquiler(**alquiler_data.model_dump())
    db.add(nuevo_alquiler)
    db.commit()
    db.refresh(nuevo_alquiler)
    
    return nuevo_alquiler

@router.get("/alquileres", response_model=dict)
@limiter.limit("60/minute")
async def get_alquileres(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener alquileres del usuario con paginación"""
    # Get user's property IDs
    property_ids = db.query(Propiedad.id).filter(
        Propiedad.user_id == current_user.id
    ).all()
    property_ids = [p[0] for p in property_ids]
    
    # Get total count
    total = db.query(func.count(Alquiler.id)).filter(
        Alquiler.propiedad_id.in_(property_ids)
    ).scalar()
    
    # Get paginated results
    alquileres = db.query(Alquiler).filter(
        Alquiler.propiedad_id.in_(property_ids)
    ).offset(skip).limit(limit).all()
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "success": True,
        "data": alquileres,
        "total": total,
        "page": (skip // limit) + 1,
        "page_size": limit,
        "total_pages": total_pages
    }

# ============= GASTOS ENDPOINTS =============

@router.post("/gastos", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_gasto(
    request: Request,
    gasto_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Crear nuevo gasto"""
    # Verify property belongs to user
    propiedad = db.query(Propiedad).filter(
        Propiedad.id == gasto_data.propiedad_id,
        Propiedad.user_id == current_user.id
    ).first()
    
    if not propiedad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    
    nuevo_gasto = Gasto(**gasto_data.model_dump())
    db.add(nuevo_gasto)
    db.commit()
    db.refresh(nuevo_gasto)
    
    return nuevo_gasto

@router.get("/gastos", response_model=dict)
@limiter.limit("60/minute")
async def get_gastos(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtener gastos del usuario con paginación"""
    # Get user's property IDs
    property_ids = db.query(Propiedad.id).filter(
        Propiedad.user_id == current_user.id
    ).all()
    property_ids = [p[0] for p in property_ids]
    
    # Get total count
    total = db.query(func.count(Gasto.id)).filter(
        Gasto.propiedad_id.in_(property_ids)
    ).scalar()
    
    # Get paginated results
    gastos = db.query(Gasto).filter(
        Gasto.propiedad_id.in_(property_ids)
    ).offset(skip).limit(limit).all()
    
    total_pages = (total + limit - 1) // limit
    
    return {
        "success": True,
        "data": gastos,
        "total": total,
        "page": (skip // limit) + 1,
        "page_size": limit,
        "total_pages": total_pages
    }
