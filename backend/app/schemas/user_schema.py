from pydantic import BaseModel, EmailStr, validator
from datetime import datetime, timezone
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    fullname: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
        
    @validator("created_at")
    def ensure_timezone(cls, v: datetime):
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v.astimezone(timezone.utc)
        
class UserUpdate(BaseModel):
    id: int
    fullname: Optional[str]
    email: Optional[EmailStr]
    
class UserResponseUpdate(BaseModel):
    fullname: Optional[str]
    email: Optional[EmailStr]

    class Config:
        from_attributes = True
        
class PasswordUpdate(BaseModel):
    currentPassword: str
    newPassword: str
    confirmPassword: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None