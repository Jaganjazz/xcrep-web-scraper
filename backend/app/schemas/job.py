from typing import List, Optional, Any, Dict
import datetime
from pydantic import BaseModel
from app.schemas.extracted import ScrapeResultPayload


class JobSummary(BaseModel):
    id: str
    target_url: str
    status: str
    total_items: int = 0
    pages_crawled: int = 1
    pages_scraped: int = 1
    duration: float = 0.0
    links_count: int = 0
    images_count: int = 0
    headings_count: int = 0
    tables_count: int = 0
    emails_count: int = 0
    words_count: int = 0
    created_at: datetime.datetime
    updated_at: datetime.datetime
    error_message: Optional[str] = None


class JobDetailResponse(JobSummary):
    options: Dict[str, Any] = {}
    results: Dict[str, Any] = {}


class JobListResponse(BaseModel):
    jobs: List[JobSummary]
    total: int
    page: int
    page_size: int
