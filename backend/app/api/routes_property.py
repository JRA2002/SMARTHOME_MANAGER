from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
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
from app.schemas.dashboard_schema import DashboardSummary
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.api.routes_logs import log_action
from app.models.logs import ActivityLog

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/recent-activities")
def get_recent_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Devuelve las últimas 4 actividades recientes del usuario autenticado
    """
    activities = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.timestamp.desc())
        .limit(4)
        .all()
    )

    # Puedes devolver un JSON limpio
    return [
        {
            "action": a.action,
            "entity": a.entity,
            "entity_id": a.entity_id,
            "timestamp": a.timestamp.isoformat()
        }
        for a in activities
    ]

@router.get("/next-expirations", summary="Obtener próximos vencimientos de alquileres y pagos de cuotas pendientes")
def get_next_expirations(
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.id
    now = datetime.utcnow()
    next_month = now + timedelta(days=30)

    # 🏠 Contratos de alquiler próximos a vencer (en los próximos 30 días)
    upcoming_rentals = (
        db.query(Rental)
        .join(Property, Rental.property_id == Property.id)
        .filter(Property.user_id == user_id)
        .filter(and_(Rental.end_date != None, Rental.end_date >= now, Rental.end_date <= next_month))
        .order_by(Rental.end_date.asc())
        .limit(5)
        .all()
    )
    print("Upcoming rentals:", upcoming_rentals)
    # # 💰 Pagos pendientes (status != 'completed')
    # pending_payments = (
    #     db.query(Payment)
    #     .join(Rental, Payment.rental_id == Rental.id)
    #     .join(Property, Rental.property_id == Property.id)
    #     .filter(Property.user_id == user_id)
    #     .filter(Payment.status != "completed")
    #     .order_by(Payment.payment_date.asc())
    #     .limit(5)
    #     .all()
    # )

    return {
        "data": [
            {
                "rental_id": r.id,
                "property_id": r.property.id,
                "tenant_name": r.tenant_name,
                "end_date": r.end_date,
                "monthly_amount": r.monthly_amount,
            }
            for r in upcoming_rentals
        ],
        # "pending_payments": [
        #     {
        #         "payment_id": p.id,
        #         "property_name": p.rental.property.name,
        #         "tenant_name": p.rental.tenant_name,
        #         "amount": p.amount,
        #         "payment_date": p.payment_date,
        #         "status": p.status,
        #     }
        #     for p in pending_payments
        # ],
    }

@router.get("/summary", response_model=DashboardSummary)
@limiter.limit("30/minute")
def get_dashboard_summary(
    request: Request,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id
    value = []
    change = []
    today = datetime.utcnow()
    current_month = today.month
    current_year = today.year
    prev_month = current_month - 1 if current_month > 1 else 12
    prev_year = current_year if current_month > 1 else current_year - 1

    total_properties = (
        db.query(func.count(Property.id))
        .filter(Property.user_id == user_id)
        .scalar()
        or 0
    )

    previous_properties = (
        db.query(func.count(Property.id))
        .filter(Property.user_id == user_id)
        .filter(extract('month', Property.created_at) == prev_month)
        .filter(extract('year', Property.created_at) == prev_year)
        .scalar()
        or 0
    )

    total_rentals = (
        db.query(func.count(Rental.id))
        .join(Property, Rental.property_id == Property.id)
        .filter(Property.user_id == user_id)
        .scalar()
        or 0
    )
    
    previous_rentals = (
        db.query(func.count(Rental.id))
        .join(Property, Rental.property_id == Property.id)
        .filter(Property.user_id == user_id)
        .filter(extract('month', Rental.start_date) == prev_month)
        .filter(extract('year', Rental.start_date) == prev_year)
        .scalar()
        or 0
    )

    total_rentals_current = (
        db.query(func.sum(Rental.monthly_amount))
        .join(Property, Rental.property_id == Property.id)
        .filter(Property.user_id == user_id)
        .filter(extract("year", Rental.start_date) == current_year)
        .filter(extract("month", Rental.start_date) == current_month)
        .scalar()
        or 0
    )

    total_expenses_current = (
        db.query(func.sum(Expense.amount))
        .join(Property, Expense.property_id == Property.id)
        .filter(Property.user_id == user_id)
        .filter(extract("year", Expense.date) == current_year)
        .filter(extract("month", Expense.date) == current_month)
        .scalar()
        or 0
    )
    
    profit_current = total_rentals_current - total_expenses_current

    total_rentals_prev = (
        db.query(func.sum(Rental.monthly_amount))
        .join(Property, Rental.property_id == Property.id)
        .filter(Property.user_id == user_id)
        .filter(extract("year", Rental.start_date) == prev_year)
        .filter(extract("month", Rental.start_date) == prev_month)
        .scalar()
        or 0
    )

    profit_prev = total_rentals_prev - (
        db.query(func.sum(Expense.amount))
        .join(Property, Expense.property_id == Property.id)
        .filter(Property.user_id == user_id)
        .filter(extract("year", Expense.date) == prev_year)
        .filter(extract("month", Expense.date) == prev_month)
        .scalar()
        or 0
    )
    
    total_value_current = (
        db.query(func.sum(Property.price))
        .filter(Property.user_id == user_id)
        .filter(extract("year", Property.updated_at) == current_year)
        .filter(extract("month", Property.updated_at) == current_month)
        .scalar()
        or 0
    )
    
    total_value_prev = (
        db.query(func.sum(Property.price))
        .filter(Property.user_id == user_id)
        .filter(extract("year", Property.updated_at) == prev_year)
        .filter(extract("month", Property.updated_at) == prev_month)
        .scalar()
        or 0
    )
    
    def calculate_change(current, previous):
        if not previous or previous == 0:
            return 0.0
        return round(((current - previous) / previous) * 100, 2)
    
    value.append(total_properties)
    change.append(calculate_change(total_properties, previous_properties))
    value.append(total_rentals)
    change.append(calculate_change(total_rentals, previous_rentals))
    value.append(total_rentals_current - total_expenses_current)
    change.append(calculate_change(profit_current, profit_prev))
    value.append(total_value_current)
    change.append(calculate_change(total_value_current, total_value_prev))
    
    return {"value": value, "change": change}
    

@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
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
    return current_user

@router.post("/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_property(
    request: Request,
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    new_property = Property(
        **property_data.model_dump(),
        user_id=current_user.id
    )
    
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    log_action(db, current_user.id, "CREATE", "PROPERTY", new_property.id)
    
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

    total = db.query(func.count(Property.id)).filter(
        Property.user_id == current_user.id
    ).scalar()

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
    log_action(db, current_user.id, "UPDATE", "PROPERTY", property.id)
    return property

@router.put("/properties/{property_id}/status")
def update_property_status(
    request: Request,
    property_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_status = data.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Missing status field")

    property = (
        db.query(Property)
        .filter(Property.id == property_id, Property.user_id == current_user.id)
        .first()
    )
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    property.status = new_status
    db.commit()
    db.refresh(property)

    return {"message": "Property status updated", "status": property.status}


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
    log_action(db, current_user.id, "DELETE", "PROPERTY", property.id)
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
    log_action(db, current_user.id, "CREATE", "RENTAL", new_rental.id)
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
    
    update_data = rental_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rental, field, value)
    
    rental.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(rental)
    log_action(db, rental.property.user_id, "UPDATE", "RENTAL", rental.id)
    
    return rental

@router.delete("/rentals/{rental_id}", status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")
async def delete_rental(
    request: Request,
    rental_id: int,
    db: Session = Depends(get_db)
):

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
    log_action(db, rental.property.user_id, "DELETE", "RENTAL", rental.id)
    
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
    log_action(db, current_user.id, "CREATE", "EXPENSE", new_expense.id)
    
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

    property_ids = db.query(Property.id).filter(
        Property.user_id == current_user.id
    ).all()
    property_ids = [p[0] for p in property_ids]
    
    total = db.query(func.count(Expense.id)).filter(
        Expense.property_id.in_(property_ids)
    ).scalar()
    
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
    
    update_data = expense_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)
    
    expense.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(expense)
    log_action(db, expense.property.user_id, "UPDATE", "EXPENSE", expense.id)
    
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
    log_action(db, expense.property.user_id, "DELETE", "EXPENSE", expense.id)
    
    return {
        "success": True,
        "message": "Expense deleted successfully"
    }