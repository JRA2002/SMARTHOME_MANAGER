from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.requests import Request
from app.core.database_postgres import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.property import Property, Rental
from app.schemas.property_schema import RentalCreate, RentalResponse, RentalUpdate, PaginatedRentals
from app.api.routes_logs import log_action
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import selectinload

from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/", response_model=RentalResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_rental(
    request: Request,
    rental_data: RentalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new rental"""
    property_result = await db.execute(
        select(Property).filter(
            Property.id == rental_data.property_id,
            Property.user_id == current_user.id
        )
    )
    property = property_result.scalars().first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    new_rental = Rental(**rental_data.model_dump())
    db.add(new_rental)
    await db.commit()
    await db.refresh(new_rental)
    await log_action(db, current_user.id, "CREATE", "RENTAL", new_rental.id)
    return new_rental

@router.get("/", response_model=PaginatedRentals)
@limiter.limit("60/minute")
async def get_rentals(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's rentals with pagination"""
    # Get user's property IDs
    property_ids_result = await db.execute(
        select(Property.id).filter(
            Property.user_id == current_user.id
        )
    )
    property_ids_obj = property_ids_result.scalars().all() or []
    
    property_ids = [p for p in property_ids_obj]
    
    # Get total count
    total_result = await db.execute(
        select(func.count(Rental.id)).filter(
            Rental.property_id.in_(property_ids)
        )
    )
    total = total_result.scalar() or 0
    
    # Get paginated results
    rentals_result = await db.execute(
        select(Rental).filter(
            Rental.property_id.in_(property_ids)
        ).offset(skip).limit(limit)
    )
    rentals = rentals_result.scalars().all()
    
    total_pages = (total + limit - 1) // limit
   
    return PaginatedRentals(
        success=True,
        data=rentals,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        total_pages=total_pages
    )

@router.put("/{rental_id}", response_model=RentalResponse)
@limiter.limit("30/minute")
async def update_rental(
    request: Request,
    rental_id: int,
    rental_data: RentalUpdate,
    db: AsyncSession = Depends(get_db)
):

    rental_result = await db.execute(
        select(Rental)
        .options(selectinload(Rental.property))
        .filter(Rental.id == rental_id)
    )
    rental = rental_result.scalars().first()
    
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )
    
    update_data = rental_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rental, field, value)
    
    rental.updated_at = datetime.utcnow()
    rental_userid = rental.property.user_id
    
    await db.commit()
    await db.refresh(rental)
    log_action(db, rental_userid, "UPDATE", "RENTAL", rental.id)
    
    return rental

@router.delete("/{rental_id}", status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")
async def delete_rental(
    request: Request,
    rental_id: int,
    db: AsyncSession = Depends(get_db)
):

    rental_result = await db.execute(
        select(Rental)
        .options(selectinload(Rental.property))
        .filter(Rental.id == rental_id)
    )
    rental = rental_result.scalars().first()
    
    if not rental:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )
    user_id = rental.property.user_id
    print("borrando rental")
    await db.delete(rental)
    await db.commit()
    await log_action(db, user_id, "DELETE", "RENTAL", rental_id)
    
    return {
        "success": True,
        "message": "Rental deleted successfully"
    }