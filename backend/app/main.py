from fastapi import FastAPI

app = FastAPI(
    title="ArmourGuard AI",
    description="Backend API for ballistic armour health monitoring",
    version="1.0.0"
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