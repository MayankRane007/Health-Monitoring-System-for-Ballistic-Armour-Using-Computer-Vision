from fastapi import FastAPI
from .database import Base, engine
from . import models
from .routes import panels
from .routes import inspections
app = FastAPI(
    title="ArmourGuard AI",
    description="Backend API for ballistic armour health monitoring",
    version="1.0.0"
)
Base.metadata.create_all(bind=engine)
app.include_router(panels.router)
app.include_router(inspections.router)

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