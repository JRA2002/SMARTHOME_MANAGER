from app.api import routes_dashboard
from fastapi import FastAPI, Request, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.database_postgres import engine, Base
from app.api import routes_chat, routes_properties, routes_auth, routes_analize, routes_rental, routes_expenses
from app.core.config import settings
from app.core.security import get_current_user

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="SmartHome Manager API",
    description="API para gestión de propiedades, alquileres y valoración con IA",
    version="1.0.0",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Error interno del servidor",
            "detail": str(exc) if settings.DEBUG else "Ha ocurrido un error inesperado"
        }
    )

app.include_router(
    routes_dashboard.router,
    prefix="/api/v1",
    tags=["Dashboard"],
)
app.include_router(
    routes_chat.router,
    prefix="/api/v1/chat",
    tags=["Chat IA"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    routes_auth.router,
    prefix="/api/v1/auth",
    tags=["Authenticacion"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    routes_analize.router,
    prefix="/api/v1/analyze",
    tags=["Analisis de archivos"],
)

app.include_router(
    routes_properties.router,
    prefix="/api/v1/properties",
    tags=["Propiedades"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    routes_rental.router,
    prefix="/api/v1/rentals",
    tags=["Alquileres"],
    dependencies=[Depends(get_current_user)]
)

app.include_router(
    routes_expenses.router,
    prefix="/api/v1/expenses",
    tags=["Gastos"],
    dependencies=[Depends(get_current_user)]
)

@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    return {
        "success": True,
        "message": "SmartHome Manager API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/v1/health")
@limiter.limit("30/minute")
async def health_check(request: Request):
    return {
        "success": True,
        "status": "healthy",
        "version": "1.0.0"
    }