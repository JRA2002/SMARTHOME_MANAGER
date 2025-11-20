from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, extract, and_, select
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from app.core.database_postgres import get_db
from app.core.security import (
    get_current_user,
    get_password_hash,
    verify_password,
    create_access_token
)
from app.models.user import User
from app.models.property import Property, Rental, Expense
from app.schemas.user_schema import Token, UserResponse, UserLogin, UserCreate
from app.schemas.dashboard_schema import DashboardSummary
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.logs import ActivityLog

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Registra un nuevo usuario en la aplicación.

    Parámetros:
        user_data (UserCreate): datos del usuario a registrar

    Respuesta:
        UserResponse: datos del usuario registrado

    Excepciones:
        HTTPException: si el email ya está registrado

    Límite de tasa:
        5 solicitudes por minuto
    """
    result = await db.execute(select(User).filter(User.email == user_data.email))
    existing_user = result.scalars().first()
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
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(
    request: Request,
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Inicia sesión en la aplicación.

    Parámetros:
        credentials (UserLogin): email y contraseña del usuario

    Respuesta:
        Token: token de acceso y tipo de token

    Excepciones:
        HTTPException: si el email o contraseña son incorrectos
        HTTPException: si el usuario no está activo

    Límite de tasa:
        10 solicitudes por minuto
    """
    result = await db.execute(select(User).filter(User.email == credentials.email))
    user = result.scalars().first()
    
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
@router.get("/recent-activities")
async def get_recent_activities(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Devuelve las últimas 4 actividades recientes del usuario autenticado
    """
    activities_result = await db.execute(
        select(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.timestamp.desc())
        .limit(4)
    )
    activities = activities_result.scalars().all()
   
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
async def get_next_expirations(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    
    """
    Obtiene los próximos 5 vencimientos de alquileres para el usuario autenticado.
    
    Parameters:
    request (Request): La petición HTTP actual.
    db (Session): La sesión de la base de datos.
    current_user (dict): El usuario autenticado actual.
    
    Returns:
    dict: Un objeto JSON que contiene los próximos vencimientos de alquileres.
    """
    user_id = current_user.id
    now = datetime.utcnow()
    next_month = now + timedelta(days=30)

    upcoming_rentals_result = await db.execute(
            select(Rental)
            .options(selectinload(Rental.property))
            .join(Property, Rental.property_id == Property.id)
            .filter(Property.user_id == user_id)
            .filter(and_(Rental.end_date != None, Rental.end_date >= now, Rental.end_date <= next_month))
            .order_by(Rental.end_date.asc())
            .limit(5)
        )
    upcoming_rentals = upcoming_rentals_result.scalars().all()

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
        ]
    }

@router.get("/summary", response_model=DashboardSummary)
@limiter.limit("30/minute")
async def get_dashboard_summary(
    request: Request,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene un resumen de la información del usuario autenticado.
    
    La respuesta contiene un objeto JSON con dos claves: "value" y "change".
    La clave "value" contiene una lista de 5 valores que corresponden a:
    - El total de propiedades del usuario
    - El total de alquileres del usuario
    - La ganancia total del usuario en el mes actual
    - El valor total de las propiedades del usuario en el mes actual
    - El valor total de las propiedades del usuario en el mes anterior
    
    La clave "change" contiene una lista de 5 valores que corresponden a:
    - El cambio porcentual en el total de propiedades del usuario entre el mes actual y el anterior
    - El cambio porcentual en el total de alquileres del usuario entre el mes actual y el anterior
    - El cambio porcentual en la ganancia total del usuario entre el mes actual y el anterior
    - El cambio porcentual en el valor total de las propiedades del usuario entre el mes actual y el anterior
    - El cambio porcentual en el valor total de las propiedades del usuario entre el mes actual y el anterior
    """
    user_id = current_user.id
    value = []
    change = []
    today = datetime.utcnow()
    current_month = today.month
    current_year = today.year
    prev_month = current_month - 1 if current_month > 1 else 12
    prev_year = current_year if current_month > 1 else current_year - 1
    
    total_properties_result = (
        await db.execute(
            select(func.count(Property.id))
            .filter(Property.user_id == user_id)
        )
    )
    total_properties = total_properties_result.scalar() or 0

    previous_properties_result = (
        await db.execute(
            select(func.count(Property.id))
            .filter(Property.user_id == user_id)
            .filter(extract('month', Property.created_at) == prev_month)
            .filter(extract('year', Property.created_at) == prev_year)
        )
    )
    previous_properties = previous_properties_result.scalar() or 0

    total_rentals_result = (
        await db.execute(
            select(func.count(Rental.id))
            .join(Property, Rental.property_id == Property.id)
            .filter(Property.user_id == user_id)
        )
    )
    total_rentals = total_rentals_result.scalar() or 0
    
    previous_rentals_result = (
        await db.execute(
            select(func.count(Rental.id))
            .join(Property, Rental.property_id == Property.id)
            .filter(Property.user_id == user_id)
            .filter(extract('month', Rental.start_date) == prev_month)
            .filter(extract('year', Rental.start_date) == prev_year)
        )
    )
    previous_rentals = previous_rentals_result.scalar() or 0

    total_rentals_result = (
        await db.execute(
            select(func.sum(Rental.monthly_amount))
            .join(Property, Rental.property_id == Property.id)
            .filter(Property.user_id == user_id)
            .filter(extract("year", Rental.start_date) == current_year)
            .filter(extract("month", Rental.start_date) == current_month)
        )
    )
 
    total_expenses_result = (
        await db.execute(
            select(func.sum(Expense.amount))
            .join(Property, Expense.property_id == Property.id)
            .filter(Property.user_id == user_id)
            .filter(extract("year", Expense.date) == current_year)
            .filter(extract("month", Expense.date) == current_month)
        )
    )
    total_expenses_current = total_expenses_result.scalar() or 0
    total_rentals_current = total_rentals_result.scalar() or 0
    
    profit_current = total_rentals_current - total_expenses_current

    total_rentals_prev_result = (
        await db.execute(
            select(func.sum(Rental.monthly_amount))
            .join(Property, Rental.property_id == Property.id)
            .filter(Property.user_id == user_id)
            .filter(extract("year", Rental.start_date) == prev_year)
            .filter(extract("month", Rental.start_date) == prev_month)
        )
    )
    total_rentals_prev = total_rentals_prev_result.scalar() or 0

    total_expenses_prev_result = (
        await db.execute(
            select(func.sum(Expense.amount))
            .join(Property, Expense.property_id == Property.id)
            .filter(Property.user_id == user_id)
            .filter(extract("year", Expense.date) == prev_year)
            .filter(extract("month", Expense.date) == prev_month)
        )
    )
    total_expenses_prev = total_expenses_prev_result.scalar() or 0

    profit_prev = total_rentals_prev - total_expenses_prev

    total_value_current_result = (
        await db.execute(
            select(func.sum(Property.price))
            .filter(Property.user_id == user_id)
            .filter(extract("year", Property.updated_at) == current_year)
            .filter(extract("month", Property.updated_at) == current_month)
        )
    )
    total_value_current = total_value_current_result.scalar() or 0

    total_value_prev_result = (
        await db.execute(
            select(func.sum(Property.price))
            .filter(Property.user_id == user_id)
            .filter(extract("year", Property.updated_at) == prev_year)
            .filter(extract("month", Property.updated_at) == prev_month)
        )
    )
    total_value_prev = total_value_prev_result.scalar() or 0
    
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