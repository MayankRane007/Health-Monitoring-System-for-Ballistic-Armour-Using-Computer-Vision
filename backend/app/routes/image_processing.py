
from pathlib import Path
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Image as InspectionImage

from ..services.imagej_service import (
    process_image_with_fiji,
    inspect_image_with_fiji
)


# ============================================================
# 1. ROUTER CONFIGURATION
# ============================================================

router = APIRouter(
    prefix="/image-processing",
    tags=["Image Processing"]
)


# ============================================================
# 2. PROJECT DIRECTORIES
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[3]

UPLOAD_DIR = (
    PROJECT_ROOT / "backend" / "uploads"
).resolve()

RESULTS_DIR = (
    UPLOAD_DIR / "inspection_results"
).resolve()


# ============================================================
# 3. HELPER: GET UPLOADED IMAGE
# ============================================================

def get_uploaded_image(image_id: int, db: Session):

    image_record = (
        db.query(InspectionImage)
        .filter(InspectionImage.id == image_id)
        .first()
    )

    if not image_record:
        raise HTTPException(
            status_code=404,
            detail="Uploaded image not found"
        )

    original_path = (
        PROJECT_ROOT / image_record.file_path
    ).resolve()

    if not original_path.is_relative_to(UPLOAD_DIR):
        raise HTTPException(
            status_code=400,
            detail="Invalid image file location"
        )

    if not original_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Original image file not found on disk"
        )

    return image_record, original_path


# ============================================================
# 4. HELPER: CONVERT FILE PATH TO FRONTEND URL
# ============================================================

def create_result_url(file_path: str) -> str:

    resolved_path = Path(file_path).resolve()

    if not resolved_path.is_relative_to(RESULTS_DIR):
        raise HTTPException(
            status_code=500,
            detail="Generated result is outside the results directory"
        )

    if not resolved_path.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"Generated result not found: {resolved_path.name}"
        )

    relative_path = resolved_path.relative_to(
        RESULTS_DIR
    ).as_posix()

    return (
        "/image-processing/results/"
        + quote(relative_path, safe="/")
    )


# ============================================================
# 5. SERVE GENERATED IMAGE AND CSV FILES
# ============================================================

@router.get("/results/{file_path:path}")
def get_analysis_result(file_path: str):

    requested_path = (
        RESULTS_DIR / file_path
    ).resolve()

    # Prevent access outside inspection_results
    if not requested_path.is_relative_to(RESULTS_DIR):
        raise HTTPException(
            status_code=400,
            detail="Invalid result file location"
        )

    if not requested_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Analysis result file not found"
        )

    suffix = requested_path.suffix.lower()

    media_types = {
        ".tif": "image/tiff",
        ".tiff": "image/tiff",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".csv": "text/csv"
    }

    return FileResponse(
        path=str(requested_path),
        media_type=media_types.get(
            suffix,
            "application/octet-stream"
        ),
        filename=requested_path.name
    )


# ============================================================
# 6. BASIC GRAYSCALE PROCESSING
# ============================================================

@router.post("/grayscale/{image_id}")
def convert_image_to_grayscale(
    image_id: int,
    db: Session = Depends(get_db)
):

    image_record, original_path = get_uploaded_image(
        image_id,
        db
    )

    try:

        processed_path = process_image_with_fiji(
            str(original_path)
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Grayscale processing failed: {error}"
        )

    return FileResponse(
        path=str(processed_path),
        media_type="image/tiff",
        filename=processed_path.name
    )


# ============================================================
# 7. AUTOMATED DAMAGE-CANDIDATE ANALYSIS
# ============================================================

@router.post("/analyze/{image_id}")
def analyze_image(
    image_id: int,
    db: Session = Depends(get_db)
):

    # STEP 1: Retrieve uploaded image

    image_record, original_path = get_uploaded_image(
        image_id,
        db
    )

    # STEP 2: Retrieve associated inspection

    inspection = image_record.inspection

    if not inspection:

        raise HTTPException(
            status_code=404,
            detail="Associated inspection not found"
        )

    # STEP 3: Inspector information

    inspector_name = (
        inspection.inspector_name or "Unassigned"
    )

    inspection_id = inspection.id

    # STEP 4: Determine surface

    surface = (
        image_record.surface or ""
    ).lower().strip()

    if surface not in ["front", "back"]:

        raise HTTPException(
            status_code=400,
            detail="Invalid surface. Expected front or back."
        )

    # STEP 5: Execute Fiji analysis

    try:

        result = inspect_image_with_fiji(
            input_path=str(original_path),
            inspector_name=inspector_name,
            inspection_id=inspection_id,
            surface=surface
        )

    except FileNotFoundError as error:

        raise HTTPException(
            status_code=500,
            detail=f"Required Fiji file not found: {error}"
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {error}"
        )

    # STEP 6: Generate accessible frontend URLs

    original_url = create_result_url(
        result["original_image"]
    )

    grayscale_url = create_result_url(
        result["grayscale_image"]
    )

    annotated_url = create_result_url(
        result["annotated_image"]
    )

    measurements_url = create_result_url(
        result["measurements_file"]
    )

    # STEP 7: Return JSON response

    return {

        "message": "Image analysis completed successfully",

        "processing_status": "completed",

        "image_id": image_id,

        "inspection_id": inspection_id,

        "inspector_name": inspector_name,

        "surface": surface,

        "original_image_url": original_url,

        "grayscale_image_url": grayscale_url,

        "annotated_image_url": annotated_url,

        "measurements_file_url": measurements_url,

        "result_folder": result["result_folder"],

        "execution_time_seconds": (
            result["execution_time_seconds"]
        ),

        "inspector_review_required": True

    }
