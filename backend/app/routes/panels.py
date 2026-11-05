
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Panel
from ..schemas import PanelCreate, PanelResponse

router = APIRouter(
    prefix="/panels",
    tags=["Panels"]
)


# Register a new panel
@router.post("/", response_model=PanelResponse)
def register_panel(
    panel: PanelCreate,
    db: Session = Depends(get_db)
):
    existing_panel = db.query(Panel).filter(
        Panel.panel_id == panel.panel_id
    ).first()

    if existing_panel:
        raise HTTPException(
            status_code=400,
            detail="Panel ID already exists"
        )

    new_panel = Panel(**panel.model_dump())

    db.add(new_panel)
    db.commit()
    db.refresh(new_panel)

    return new_panel


# Get all registered panels
@router.get("/", response_model=list[PanelResponse])
def get_panels(db: Session = Depends(get_db)):
    return db.query(Panel).all()


# Get a particular panel using its ID
@router.get("/{panel_id}", response_model=PanelResponse)
def get_panel(panel_id: str, db: Session = Depends(get_db)):

    panel = db.query(Panel).filter(
        Panel.panel_id == panel_id
    ).first()

    if not panel:
        raise HTTPException(
            status_code=404,
            detail="Panel not found"
        )

    return panel
