from app.schemas.property_schema import PropertyCreate, PropertyResponse, PaginatedProperties, PropertyUpdate
from app.models.property import Property
from app.api.routes_logs import log_action

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from datetime import datetime, timezone
from app.core.database_postgres import get_db
from app.core.security import get_current_user
from app.models.user import User

from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_property(
    request: Request,
    property_data: PropertyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
   
    new_property = Property(
        **property_data.model_dump(),
        user_id=current_user.id
    )
    
    db.add(new_property)
    await db.commit()
    await db.refresh(new_property)
    await log_action(db, current_user.id, "CREATE", "PROPERTY", new_property.id)
    
    return new_property

@router.get("/", response_model=PaginatedProperties)
@limiter.limit("60/minute")
async def get_properties(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    total_result = await db.execute(
        select(func.count(Property.id)).filter(
            Property.user_id == current_user.id
        )
    )
    total = total_result.scalar() or 0

    properties_result = await db.execute(
        select(Property).filter(
            Property.user_id == current_user.id
        ).offset(skip).limit(limit)
    )
    properties = properties_result.scalars().all()

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

@router.get("/{property_id}", response_model=PropertyResponse)
@limiter.limit("60/minute")
async def get_property(
    request: Request,
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get property by ID"""
    property_result = await db.execute(
        select(Property).filter(
            Property.id == property_id,
            Property.user_id == current_user.id
        )
    )
    property = property_result.scalars().first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    return property

@router.put("/{property_id}", response_model=PropertyResponse)
@limiter.limit("30/minute")
async def update_property(
    request: Request,
    property_id: int,
    property_data: PropertyUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update property"""
    property_result = await db.execute(
        select(Property).filter(
            Property.id == property_id,
            Property.user_id == current_user.id
        )
    )
    property = property_result.scalars().first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    # Update only provided fields
    update_data = property_data.model_dump(exclude_unset=True)
   
    for field, value in update_data.items():
        setattr(property, field, value)
    
    property.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(property)
    log_action(db, current_user.id, "UPDATE", "PROPERTY", property.id)
    
    return property

@router.put("/{property_id}/status")
async def update_property_status(
    request: Request,
    property_id: int,
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_status = data.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Missing status field")

    property_result = await db.execute(
        select(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
        )
    )
    property = property_result.scalars().first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    property.status = new_status
    await db.commit()
    await db.refresh(property)

    return {"message": "Property status updated", "status": property.status}


@router.delete("/{property_id}", status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")
async def delete_property(
    request: Request,
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete property"""
    property_result = await db.execute(
        select(Property).filter(
            Property.id == property_id,
            Property.user_id == current_user.id
        )
    )
    property = property_result.scalars().first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    current_user_id = current_user.id
    property_id = property.id
    
    await db.delete(property)
    await db.commit()
    await log_action(db, current_user_id, "DELETE", "PROPERTY", property_id)
    
    return {
        "success": True,
        "message": "Property deleted successfully"
    }