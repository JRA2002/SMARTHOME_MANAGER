from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
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