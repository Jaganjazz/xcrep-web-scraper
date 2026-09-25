from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.settings.settings_service import SettingsService
from app.schemas.settings import SettingsResponse, SettingsUpdateRequest

router = APIRouter()


@router.get("/", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    """Retrieves current application settings and user preferences."""
    service = SettingsService(db)
    return service.get_settings()


@router.put("/", response_model=SettingsResponse)
def update_settings(
    payload: SettingsUpdateRequest,
    db: Session = Depends(get_db),
):
    """Updates application settings and user preferences."""
    service = SettingsService(db)
    return service.update_settings(payload)
