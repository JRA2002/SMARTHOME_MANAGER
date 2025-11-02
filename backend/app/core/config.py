from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    
    APP_NAME: str = "SmartHome Manager API"
    VERSION: str = "1.0.0"
    DEBUG: bool

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    DATABASE_URL: str
    ALLOWED_ORIGINS: str = "*"
    RATE_LIMIT_PER_MINUTE: int
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
