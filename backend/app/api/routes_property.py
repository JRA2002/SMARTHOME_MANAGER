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
from app.models.property import Property, Rental, Expense
from app.schemas.user_schema import Token, UserResponse, UserLogin, UserCreate
from app.schemas.property_schema import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    RentalResponse,
    RentalCreate,
    RentalUpdate,
    ExpenseCreate,
    ExpenseResponse,
    PaginatedProperties,
    PaginatedRentals,
    PaginatedExpenses,
    ExpenseUpdate
)
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# ============= AUTH ENDPOINTS =============

@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    user_data: UserCreate,
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
    credentials: UserLogin,
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

@router.get("/auth/me", response_model=UserResponse)
@limiter.limit("30/minute")
async def get_current_user_info(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Obtener información del usuario actual"""
    return current_user

# ============= PROPIEDADES ENDPOINTS =============

@router.post("/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_property(
    request: Request,
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new property"""
    new_property = Property(
        **property_data.model_dump(),
        user_id=current_user.id
    )
    
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    
    return new_property

@router.get("/properties", response_model=PaginatedProperties)
@limiter.limit("60/minute")
async def get_properties(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's properties with pagination"""

    # Total de propiedades del usuario
    total = db.query(func.count(Property.id)).filter(
        Property.user_id == current_user.id
    ).scalar()

    # Resultados paginados
    properties = db.query(Property).filter(
        Property.user_id == current_user.id
    ).offset(skip).limit(limit).all()

    total_pages = (total + limit - 1) // limit
    current_page = (skip // limit) + 1

    return PaginatedProperties(
        success=True,
        data=properties,
        total=total,
        page=current_page,
        page_size=limit,
        total_pages=total_pages
    )

@router.get("/properties/{property_id}", response_model=PropertyResponse)
@limiter.limit("60/minute")
async def get_property(
    request: Request,
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get property by ID"""
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    return property

@router.put("/properties/{property_id}", response_model=PropertyResponse)
@limiter.limit("30/minute")
async def update_property(
    request: Request,
    property_id: int,
    property_data: PropertyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update property"""
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Update only provided fields
    update_data = property_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property, field, value)
    
    property.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(property)
    
    return property

@router.delete("/properties/{property_id}", status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")
async def delete_property(
    request: Request,
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete property"""
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    db.delete(property)
    db.commit()
    
    return {
        "success": True,
        "message": "Property deleted successfully"
    }

# ============= ALQUILERES ENDPOINTS =============

@router.post("/rentals", response_model=RentalResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_rental(
    request: Request,
    rental_data: RentalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new rental"""
    # Verify property belongs to user
    property = db.query(Property).filter(
        Property.id == rental_data.property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    new_rental = Rental(**rental_data.model_dump())
    db.add(new_rental)
    db.commit()
    db.refresh(new_rental)
    print("New rental created:", new_rental)
    return new_rental

@router.get("/rentals", response_model=PaginatedRentals)
@limiter.limit("600/minute")
async def get_rentals(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's rentals with pagination"""
    # Get user's property IDs
    property_ids = db.query(Property.id).filter(
        Property.user_id == current_user.id
    ).all()
    property_ids = [p[0] for p in property_ids]
    
    # Get total count
    total = db.query(func.count(Rental.id)).filter(
        Rental.property_id.in_(property_ids)
    ).scalar()
    
    # Get paginated results
    rentals = db.query(Rental).filter(
        Rental.property_id.in_(property_ids)
    ).offset(skip).limit(limit).all()
    total_pages = (total + limit - 1) // limit
   
    return PaginatedRentals(
        success=True,
        data=rentals,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        total_pages=total_pages
    )


@router.put("/rentals/{rental_id}", response_model=RentalResponse)
@limiter.limit("30/minute")
async def update_rental(
    request: Request,
    rental_id: int,
    rental_data: RentalUpdate,
    db: Session = Depends(get_db)
):
    """Update rental"""
    print("Updating rental with data:", rental_id)
    print("rental data aqui:", rental_data),
    rental = db.query(Rental).filter(
        Rental.id == rental_id,
    ).first()
    print("Rental to update:", rental)
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )
    
    # Update only provided fields
    update_data = rental_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rental, field, value)
    
    rental.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(rental)
    
    return rental

@router.delete("/rentals/{rental_id}", status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")
async def delete_rental(
    request: Request,
    rental_id: int,
    db: Session = Depends(get_db)
):
    """Delete rental"""
    rental = db.query(Rental).filter(
        Rental.id == rental_id,
    ).first()
    
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )
    
    db.delete(rental)
    db.commit()
    
    return {
        "success": True,
        "message": "Rental deleted successfully"
    }

# ============= GASTOS ENDPOINTS =============

@router.post("/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_expense(
    request: Request,
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new expense"""
    # Verify property belongs to user
    property = db.query(Property).filter(
        Property.id == expense_data.property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    new_expense = Expense(**expense_data.model_dump())
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    
    return new_expense

@router.get("/expenses", response_model=PaginatedExpenses)
@limiter.limit("60/minute")
async def get_expenses(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's expenses with pagination"""
    # Get user's property IDs
    property_ids = db.query(Property.id).filter(
        Property.user_id == current_user.id
    ).all()
    property_ids = [p[0] for p in property_ids]
    
    # Get total count
    total = db.query(func.count(Expense.id)).filter(
        Expense.property_id.in_(property_ids)
    ).scalar()
    
    # Get paginated results
    expenses = db.query(Expense).filter(
        Expense.property_id.in_(property_ids)
    ).offset(skip).limit(limit).all()
    
    total_pages = (total + limit - 1) // limit
    
    return PaginatedExpenses(
        success=True,
        data=expenses,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        total_pages=total_pages
    )

@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
@limiter.limit("30/minute")
async def update_expense(
    request: Request,
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
    ).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )
    
    # Update only provided fields
    update_data = expense_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)
    
    expense.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(expense)
    
    return expense

@router.delete("/expenses/{expense_id}", status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")
async def delete_expense(
    request: Request,
    expense_id: int,
    db: Session = Depends(get_db)
):
    
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
    ).first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    db.delete(expense)
    db.commit()
    
    return {
        "success": True,
        "message": "Expense deleted successfully"
    }