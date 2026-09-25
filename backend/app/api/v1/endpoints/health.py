from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("", include_in_schema=False)
@router.get("/")
def health_check():
    """Health check endpoint confirming API service is operational."""
    return {
        "status": "ok",
        "health": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }

