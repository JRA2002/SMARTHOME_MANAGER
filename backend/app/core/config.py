from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    
    APP_NAME: str = "SmartHome Manager API"
    VERSION: str = "1.0.0"
    DEBUG: bool

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    ALLOWED_ORIGINS: str
    RATE_LIMIT_PER_MINUTE: int
    
    BASE_URL_API_GROQ: str
    SECRET_KEY_API_GROQ: str
    
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: int
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
