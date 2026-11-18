
import re
import shutil
import subprocess
import time
import uuid

from pathlib import Path


# ============================================================
# 1. CONFIGURATION
# ============================================================

FIJI_EXE = Path(
    r"D:\fiji-latest-win64-jdk\Fiji\fiji-windows-x64.exe"
)

# Project root: ArmourGuard-AI
PROJECT_ROOT = Path(__file__).resolve().parents[3]

# ImageJ macros
MACRO_DIR = (
    PROJECT_ROOT
    / "backend"
    / "imagej"
    / "macros"
)

# General processed image directory
OUTPUT_DIR = (
    PROJECT_ROOT
    / "backend"
    / "uploads"
    / "processed"
)

# Inspector-specific results directory
RESULTS_DIR = (
    PROJECT_ROOT
    / "backend"
    / "uploads"
    / "inspection_results"
)

# Maximum time allowed for one Fiji execution
PROCESSING_TIMEOUT = 180


# ============================================================
# 2. ENVIRONMENT VALIDATION
# ============================================================

def validate_environment():

    if not FIJI_EXE.is_file():
        raise FileNotFoundError(
            f"Fiji executable not found: {FIJI_EXE}"
        )

    if not MACRO_DIR.is_dir():
        raise FileNotFoundError(
            f"ImageJ macro directory not found: {MACRO_DIR}"
        )

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    RESULTS_DIR.mkdir(
        parents=True,
        exist_ok=True
    )


# ============================================================
# 3. SAFE INSPECTOR FOLDER NAME
# ============================================================

def safe_folder_name(value: str) -> str:

    value = str(value or "unassigned").strip().lower()

    value = re.sub(
        r"[^a-z0-9_-]+",
        "_",
        value
    )

    value = value.strip("_")

    return value or "unassigned"


# ============================================================
# 4. VERIFY GENERATED OUTPUT FILES
# ============================================================

def verify_output_files(outputs: dict):

    for output_name, output_path in outputs.items():

        if not output_path.is_file():

            raise RuntimeError(
                f"Fiji did not generate {output_name}: "
                f"{output_path}"
            )

        if output_path.stat().st_size == 0:

            raise RuntimeError(
                f"Generated file is empty: {output_path}"
            )


# ============================================================
# 5. EXECUTE IMAGEJ MACRO
# ============================================================

def execute_imagej_macro(
    macro_path: Path,
    arguments: list[str]
):

    if not macro_path.is_file():
        raise FileNotFoundError(
            f"ImageJ macro not found: {macro_path}"
        )

    # Validate macro arguments
    for argument in arguments:

        if "|" in str(argument):

            raise ValueError(
                "File paths cannot contain the | character."
            )

    # ImageJ macro receives arguments separated by |
    macro_arguments = "|".join(
        str(argument) for argument in arguments
    )

    command = [
        str(FIJI_EXE),
        "--headless",
        "-macro",
        str(macro_path),
        macro_arguments
    ]

    print("\n========================================")
    print("STARTING FIJI IMAGE PROCESSING")
    print("Macro:", macro_path.name)
    print("========================================")

    start_time = time.perf_counter()

    try:

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=PROCESSING_TIMEOUT
        )

    except subprocess.TimeoutExpired as error:

        elapsed = time.perf_counter() - start_time

        stdout = error.stdout or ""
        stderr = error.stderr or ""

        if isinstance(stdout, bytes):
            stdout = stdout.decode(errors="replace")

        if isinstance(stderr, bytes):
            stderr = stderr.decode(errors="replace")

        raise RuntimeError(
            f"Fiji processing exceeded "
            f"{PROCESSING_TIMEOUT} seconds.\n"
            f"Elapsed time: {elapsed:.2f} seconds.\n"
            f"ImageJ output: {stdout}\n"
            f"ImageJ errors: {stderr}"
        ) from error

    except OSError as error:

        raise RuntimeError(
            f"Unable to start Fiji: {error}"
        ) from error

    elapsed = time.perf_counter() - start_time

    print("\n========== FIJI LOG ==========")
    print("Execution time:", round(elapsed, 2), "seconds")

    print("\nSTDOUT:")
    print(result.stdout)

    print("\nSTDERR:")
    print(result.stderr)

    print("==============================\n")

    if result.returncode != 0:

        raise RuntimeError(
            "Fiji execution failed.\n"
            f"Return code: {result.returncode}\n"
            f"STDOUT: {result.stdout}\n"
            f"STDERR: {result.stderr}"
        )

    return {
        "execution_time_seconds": round(elapsed, 2),
        "stdout": result.stdout,
        "stderr": result.stderr
    }


# ============================================================
# 6. BASIC GRAYSCALE PROCESSING
# ============================================================

def process_image_with_fiji(input_path: str) -> Path:

    validate_environment()

    input_file = Path(input_path).resolve()

    if not input_file.is_file():

        raise FileNotFoundError(
            f"Input image not found: {input_file}"
        )

    unique_id = uuid.uuid4().hex[:8]

    output_file = (
        OUTPUT_DIR
        / f"{input_file.stem}_grayscale_{unique_id}.tif"
    )

    macro_path = MACRO_DIR / "grayscale.ijm"

    execute_imagej_macro(
        macro_path,
        [
            str(input_file),
            str(output_file)
        ]
    )

    verify_output_files({
        "grayscale image": output_file
    })

    print(
        "Grayscale image successfully generated:",
        output_file
    )

    return output_file


# ============================================================
# 7. AUTOMATED DAMAGE-CANDIDATE ANALYSIS
# ============================================================

def inspect_image_with_fiji(
    input_path: str,
    inspector_name: str,
    inspection_id: int,
    surface: str
) -> dict:

    validate_environment()

    # --------------------------------------------------------
    # VALIDATE INPUT
    # --------------------------------------------------------

    input_file = Path(input_path).resolve()

    if not input_file.is_file():

        raise FileNotFoundError(
            f"Input image not found: {input_file}"
        )

    if not isinstance(inspection_id, int) or inspection_id <= 0:

        raise ValueError(
            "Inspection ID must be a positive integer."
        )

    surface = str(surface).strip().lower()

    if surface not in ("front", "back"):

        raise ValueError(
            "Surface must be either 'front' or 'back'."
        )

    inspector_name = str(
        inspector_name or "unassigned"
    ).strip()

    # --------------------------------------------------------
    # CREATE INSPECTOR FOLDER
    # --------------------------------------------------------

    inspector_folder = (
        RESULTS_DIR
        / f"inspector_{safe_folder_name(inspector_name)}"
    )

    # --------------------------------------------------------
    # CREATE INSPECTION FOLDER
    # --------------------------------------------------------

    inspection_folder = (
        inspector_folder
        / f"inspection_{inspection_id}"
    )

    # --------------------------------------------------------
    # CREATE FRONT/BACK FOLDER
    # --------------------------------------------------------

    surface_folder = (
        inspection_folder
        / surface
    )

    surface_folder.mkdir(
        parents=True,
        exist_ok=True
    )

    # --------------------------------------------------------
    # GENERATE UNIQUE FILENAMES
    # --------------------------------------------------------

    unique_id = uuid.uuid4().hex[:8]

    original_copy = (
        surface_folder
        / f"{input_file.stem}_original_{unique_id}"
        f"{input_file.suffix.lower()}"
    )

    grayscale_output = (
        surface_folder
        / f"{input_file.stem}_grayscale_{unique_id}.tif"
    )

    annotated_output = (
        surface_folder
        / f"{input_file.stem}_annotated_{unique_id}.tif"
    )

    measurements_output = (
        surface_folder
        / f"{input_file.stem}_measurements_{unique_id}.csv"
    )

    # --------------------------------------------------------
    # COPY ORIGINAL IMAGE
    # --------------------------------------------------------

    shutil.copy2(
        input_file,
        original_copy
    )

    print("\n========================================")
    print("ARMOURGUARD IMAGE ANALYSIS")
    print("Inspector:", inspector_name)
    print("Inspection ID:", inspection_id)
    print("Surface:", surface)
    print("Input:", input_file.name)
    print("========================================")

    # --------------------------------------------------------
    # EXECUTE DAMAGE ANALYSIS MACRO
    # --------------------------------------------------------

    macro_path = (
        MACRO_DIR / "damage_analysis.ijm"
    )

    execution_details = execute_imagej_macro(
        macro_path,
        [
            str(input_file),
            str(grayscale_output),
            str(annotated_output),
            str(measurements_output)
        ]
    )

    # --------------------------------------------------------
    # VERIFY GENERATED FILES
    # --------------------------------------------------------

    outputs = {
        "original image": original_copy,
        "grayscale image": grayscale_output,
        "annotated image": annotated_output,
        "measurements CSV": measurements_output
    }

    verify_output_files(outputs)

    # --------------------------------------------------------
    # RETURN RESULTS
    # --------------------------------------------------------

    result = {
        "processing_status": "completed",

        "inspection_id": inspection_id,

        "inspector_name": inspector_name,

        "surface": surface,

        "original_image": str(original_copy),

        "grayscale_image": str(grayscale_output),

        "annotated_image": str(annotated_output),

        "measurements_file": str(measurements_output),

        "result_folder": str(surface_folder),

        "execution_time_seconds": (
            execution_details["execution_time_seconds"]
        ),

        "inspector_review_required": True
    }

    print("\n========================================")
    print("IMAGE ANALYSIS COMPLETED SUCCESSFULLY")
    print("Results folder:", surface_folder)
    print("Execution time:", result["execution_time_seconds"])
    print("========================================\n")

    return result
