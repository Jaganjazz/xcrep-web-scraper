from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, model_validator


class ExtractionOptions(BaseModel):
    extract_all: bool = True
    title: bool = True
    text: bool = True
    links: bool = True
    images: bool = True
    headings: bool = True
    tables: bool = True
    metadata: bool = True
    emails: bool = True
    html: bool = False


class ScrapeRequest(BaseModel):
    url: str = Field(..., description="Target webpage URL to scrape", example="https://example.com")
    extract: Optional[ExtractionOptions] = Field(default=None, description="Extraction flags")
    options: Optional[ExtractionOptions] = Field(default=None, description="Legacy/alternative extraction options flag")
    
    # Advanced options
    user_agent: Optional[str] = Field(default=None, description="Custom User-Agent header")
    custom_headers: Optional[Dict[str, str]] = Field(default=None, description="Additional custom HTTP request headers")
    timeout: Optional[int] = Field(default=15, ge=3, le=60, description="Request timeout in seconds")
    retry_count: Optional[int] = Field(default=2, ge=0, le=5, description="Number of retry attempts upon failure")
    max_pages: Optional[int] = Field(default=1, ge=1, le=50, description="Maximum number of pages to crawl")
    max_depth: Optional[int] = Field(default=1, ge=1, le=5, description="Crawl depth (1 = single page)")
    request_delay: Optional[float] = Field(default=0.5, ge=0.0, le=10.0, description="Delay between requests in seconds")
    follow_pagination: Optional[bool] = Field(default=False, description="Whether to follow next-page pagination links")
    same_domain_only: Optional[bool] = Field(default=True, description="Restrict crawling to original domain")
    css_selector: Optional[str] = Field(default=None, description="Optional custom CSS selector for targeted extraction")

    @model_validator(mode="after")
    def unify_extraction_options(self):
        # Allow both request.extract and request.options seamlessly
        if self.extract is None and self.options is not None:
            self.extract = self.options
        elif self.extract is not None and self.options is None:
            self.options = self.extract
        elif self.extract is None and self.options is None:
            default_opts = ExtractionOptions()
            self.extract = default_opts
            self.options = default_opts
        return self


class ScrapeResponse(BaseModel):
    job_id: str
    target_url: str
    status: str
    message: str
    total_items: int = 0
    pages_crawled: int = 1
    duration_ms: float = 0.0
    results: Optional[Dict[str, Any]] = None
