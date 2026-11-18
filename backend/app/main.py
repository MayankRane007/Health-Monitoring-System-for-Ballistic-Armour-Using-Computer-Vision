
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models
from .routes import panels
from .routes import inspections
from .routes import image_processing


app = FastAPI(
    title="ArmourGuard AI",
    description="Backend API for ballistic armour health monitoring",
    version="1.0.0"
)

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Register API routes
app.include_router(panels.router)
app.include_router(inspections.router)
app.include_router(image_processing.router)


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
