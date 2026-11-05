
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Panel, Inspection
from ..schemas import InspectionCreate, InspectionResponse

from pathlib import Path
from io import BytesIO
import uuid

from PIL import Image as PILImage
from fastapi import UploadFile, File
from ..models import Image as InspectionImage


router = APIRouter(
    prefix="/inspections",
    tags=["Inspections"]
)


# Create a new inspection
@router.post("/", response_model=InspectionResponse)
def create_inspection(
    inspection: InspectionCreate,
    db: Session = Depends(get_db)
):
    # Check whether the panel exists
    panel = db.query(Panel).filter(
        Panel.panel_id == inspection.panel_id
    ).first()

    if not panel:
        raise HTTPException(
            status_code=404,
            detail="Panel not found. Register the panel first."
        )

    # Create inspection record
    new_inspection = Inspection(
        panel_id=inspection.panel_id,
        inspector_name=inspection.inspector_name,
        status="Pending"
    )

    db.add(new_inspection)
    db.commit()
    db.refresh(new_inspection)

    return new_inspection


# Get all inspections
@router.get("/", response_model=list[InspectionResponse])
def get_inspections(db: Session = Depends(get_db)):
    return db.query(Inspection).order_by(
        Inspection.id.desc()
    ).all()


# Get a particular inspection
@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db)
):
    inspection = db.query(Inspection).filter(
        Inspection.id == inspection_id
    ).first()

    if not inspection:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found"
        )

    return inspection

# Image upload configuration
PROJECT_ROOT = Path(__file__).resolve().parents[3]
UPLOAD_DIR = PROJECT_ROOT / "backend" / "uploads"

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_FORMATS = {"JPEG", "PNG"}


# Upload front or back image for an inspection
@router.post("/{inspection_id}/upload/{surface}")
async def upload_inspection_image(
    inspection_id: int,
    surface: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # 1. Validate surface
    if surface not in ["front", "back"]:
        raise HTTPException(
            status_code=400,
            detail="Surface must be either front or back"
        )

    # 2. Check whether inspection exists
    inspection = db.query(Inspection).filter(
        Inspection.id == inspection_id
    ).first()

    if not inspection:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found"
        )

    # 3. Validate file extension
    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG and PNG images are allowed"
        )

    # 4. Read and validate file size
    content = await file.read(MAX_FILE_SIZE + 1)

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty"
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Maximum image size is 10 MB"
        )

    # 5. Verify that the uploaded file is actually an image
    try:
        with PILImage.open(BytesIO(content)) as image:
            if image.format not in ALLOWED_FORMATS:
                raise HTTPException(
                    status_code=400,
                    detail="Only genuine JPEG and PNG images are allowed"
                )

            if image.width * image.height > 40_000_000:
                raise HTTPException(
                    status_code=400,
                    detail="Image dimensions are too large"
                )

            image.verify()

            actual_format = image.format

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted image"
        )

    # 6. Create the appropriate upload folder
    folder = UPLOAD_DIR / surface
    folder.mkdir(parents=True, exist_ok=True)

    # 7. Generate a unique filename
    extension_to_use = ".jpg" if actual_format == "JPEG" else ".png"
    filename = f"{uuid.uuid4()}{extension_to_use}"

    filepath = folder / filename

    # 8. Save image to disk
    filepath.write_bytes(content)

    # 9. Save image details in PostgreSQL
    relative_path = filepath.relative_to(PROJECT_ROOT).as_posix()

    new_image = InspectionImage(
        inspection_id=inspection_id,
        surface=surface,
        filename=filename,
        file_path=relative_path,
        content_type="image/jpeg" if actual_format == "JPEG"
        else "image/png"
    )

    try:
        db.add(new_image)
        db.commit()
        db.refresh(new_image)

    except Exception:
        db.rollback()
        filepath.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail="Could not save image information to database"
        )

    return {
        "message": "Image uploaded successfully",
        "image_id": new_image.id,
        "inspection_id": inspection_id,
        "surface": surface,
        "filename": filename,
        "file_path": relative_path,
        "content_type": new_image.content_type
    }
