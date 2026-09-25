from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.scrape import ScrapeRequest, ScrapeResponse
from app.services.scraping.scraping_service import ScrapingService
from app.services.validation.url_validator import URLValidatorService
from app.services.scraping.robots_service import RobotsTxtService
from app.core.exceptions import ScraperBaseException


router = APIRouter()


class ValidateUrlRequest(BaseModel):
    url: str = Field(..., example="https://example.com")


class ValidateUrlResponse(BaseModel):
    valid: bool
    normalized_url: Optional[str] = None
    robots: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@router.post("/", response_model=dict, status_code=status.HTTP_200_OK)
async def scrape_url(
    payload: ScrapeRequest,
    db: Session = Depends(get_db),
):
    """
    Scrapes a webpage, parses HTML with BeautifulSoup, executes selected extractors,
    and returns structured data.
    """
    service = ScrapingService(db)
    try:
        result = await service.execute_scrape(payload)
        return result
    except ScraperBaseException as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@router.post("/validate-url", response_model=ValidateUrlResponse, status_code=status.HTTP_200_OK)
async def validate_url(payload: ValidateUrlRequest):
    """Validates URL syntax, verifies SSRF safety, and checks domain robots.txt rules."""
    try:
        normalized = URLValidatorService.validate_and_normalize(payload.url)
        robots_info = await RobotsTxtService.check_url_permission(normalized)
        return ValidateUrlResponse(
            valid=True,
            normalized_url=normalized,
            robots=robots_info,
            error=None,
        )
    except ScraperBaseException as e:
        return ValidateUrlResponse(
            valid=False,
            normalized_url=None,
            robots=None,
            error=e.message,
        )
    except Exception as e:
        return ValidateUrlResponse(
            valid=False,
            normalized_url=None,
            robots=None,
            error=f"Invalid URL: {str(e)}",
        )
