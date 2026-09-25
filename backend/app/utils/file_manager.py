import os
from pathlib import Path
from app.core.config import settings


def ensure_export_dir() -> Path:
    """Ensures the export directory exists and returns its Path object."""
    export_path = Path(settings.EXPORT_STORAGE_DIR).resolve()
    export_path.mkdir(parents=True, exist_ok=True)
    return export_path


def get_export_file_path(filename: str) -> Path:
    """Returns absolute file path within safe export directory."""
    directory = ensure_export_dir()
    safe_path = (directory / filename).resolve()
    # Path traversal check
    if not str(safe_path).startswith(str(directory)):
        raise ValueError("Invalid export path detected.")
    return safe_path
