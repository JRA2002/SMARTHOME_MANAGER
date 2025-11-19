from fastapi import APIRouter, Depends, HTTPException,Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from app.core.database_postgres import get_db
from app.models.user import User
from app.schemas.user_schema import UserUpdate, UserResponseUpdate, PasswordUpdate
from app.core.security import get_current_user, get_password_hash
from app.schemas.user_schema import UserResponse

from app.core.security import (
    get_current_user,
    get_password_hash,
)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/me", response_model=UserResponse)
@limiter.limit("30/minute")
async def get_current_user_info(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    return current_user

@router.put("/update-profile", response_model=UserResponseUpdate)
def update_user(
    request: Request,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user_update.email and user_update.email != user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="El email ya está en uso")
        user.email = user_update.email

    if user_update.fullname:
        user.fullname = user_update.fullname

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.put("/update-password")
def update_password(
    user_update: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user_update.currentPassword:
        user.hashed_password = get_password_hash(user_update.newPassword)

    db.add(user)
    db.commit()
    db.refresh(user)

    return user