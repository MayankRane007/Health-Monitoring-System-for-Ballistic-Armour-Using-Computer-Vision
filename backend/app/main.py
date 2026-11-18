
import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .database import Base, engine
from . import models
from .security import get_current_user
from .routes import auth
from .routes import panels
from .routes import inspections
from .routes import image_processing


app = FastAPI(
    title="ArmourGuard AI",
    description="Backend API for ballistic armour health monitoring",
    version="1.0.0"
)

FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def validate_request_origin(request, call_next):
    origin = request.headers.get("origin")
    if origin and origin not in FRONTEND_ORIGINS:
        return JSONResponse(
            status_code=403,
            content={"detail": "Origin not allowed"},
        )
    return await call_next(request)


# Create database tables
Base.metadata.create_all(bind=engine)

# Register API routes
app.include_router(auth.router)
app.include_router(panels.router, dependencies=[Depends(get_current_user)])
app.include_router(inspections.router, dependencies=[Depends(get_current_user)])
app.include_router(
    image_processing.router,
    dependencies=[Depends(get_current_user)],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to ArmourGuard AI Backend",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "running",
        "project": "ArmourGuard AI"
    }
