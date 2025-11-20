from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.core.database_postgres import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.property import Property
from app.models.property import Expense
from datetime import datetime
from app.schemas.expense_schema import ExpenseCreate, ExpenseResponse, ExpenseUpdate, PaginatedExpenses
from sqlalchemy.orm import selectinload

from slowapi import Limiter
from slowapi.util import get_remote_address
from app.api.routes_logs import log_action

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_expense(
    request: Request,
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    property_result = await db.execute(
        select(Property).filter(
            Property.id == expense_data.property_id,
            Property.user_id == current_user.id
        )
    )
    property = property_result.scalars().first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    new_expense = Expense(**expense_data.model_dump())
    new_expense_id = new_expense.id
    current_user_id = current_user.id
    
    db.add(new_expense)
    await db.commit()
    await db.refresh(new_expense)
    log_action(db, current_user_id, "CREATE", "EXPENSE", new_expense_id)
    
    return new_expense

@router.get("/", response_model=PaginatedExpenses)
@limiter.limit("60/minute")
async def get_expenses(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    property_ids_result = await db.execute(
        select(Property.id).filter(
            Property.user_id == current_user.id
        )
    )
    property_ids_obj = property_ids_result.scalars().all() or []
    property_ids = [p for p in property_ids_obj]
    
    total_result = await db.execute(
        select(func.count(Expense.id)).filter(
            Expense.property_id.in_(property_ids)
        )
    )
    total = total_result.scalar() or 0
    
    expenses_result = await db.execute(
        select(Expense).filter(
            Expense.property_id.in_(property_ids)
        ).offset(skip).limit(limit)
    )
    expenses = expenses_result.scalars().all()
    
    total_pages = (total + limit - 1) // limit
    
    return PaginatedExpenses(
        success=True,
        data=expenses,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit,
        total_pages=total_pages
    )

@router.put("/{expense_id}", response_model=ExpenseResponse)
@limiter.limit("30/minute")
async def update_expense(
    request: Request,
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: AsyncSession = Depends(get_db)
):
    expense_result = await db.execute(
        select(Expense)
        .options(selectinload(Expense.property))
        .filter(Expense.id == expense_id)
    )
    expense = expense_result.scalars().first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rental not found"
        )
    
    update_data = expense_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)
    
    expense.updated_at = datetime.utcnow()
    expense_id = expense.id
    expense_user_id = expense.property.user_id
    
    await db.commit()
    await db.refresh(expense)
    log_action(db, expense_user_id, "UPDATE", "EXPENSE", expense_id)
    
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_200_OK)
@limiter.limit("20/minute")
async def delete_expense(
    request: Request,
    expense_id: int,
    db: AsyncSession = Depends(get_db)
):
    expense_result = await db.execute(
        select(Expense)
        .options(selectinload(Expense.property))
        .filter(Expense.id == expense_id)
    )
    expense = expense_result.scalars().first()
    
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
        
    user_id = expense.property.user_id
    expense_id_value = expense.id
    
    await db.delete(expense)
    await db.commit()
    await log_action(db, user_id, "DELETE", "EXPENSE", expense_id_value)
    
    return {
        "success": True,
        "message": "Expense deleted successfully"
    }