from fastapi import APIRouter
from app.api.v1.endpoints import scrape, history, datasets, export, settings, health

api_router = APIRouter()

api_router.include_router(scrape.router, prefix="/scrape", tags=["Scraping"])
api_router.include_router(history.router, prefix="/history", tags=["History"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["Saved Data"])
api_router.include_router(export.router, prefix="/export", tags=["Export"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])
