from typing import Optional, Dict
from pydantic import BaseModel


class SettingsResponse(BaseModel):
    user_agent: str
    request_timeout_seconds: int = 15
    max_concurrent_scrapes: int = 5
    allow_local_urls: bool = False
    default_export_format: str = "json"
    theme_preference: str = "dark"
    retry_count: int = 2
    max_pages: int = 10
    max_depth: int = 2
    request_delay: float = 0.5
    follow_pagination: bool = False
    custom_headers: str = ""


class SettingsUpdateRequest(BaseModel):
    user_agent: Optional[str] = None
    request_timeout_seconds: Optional[int] = None
    max_concurrent_scrapes: Optional[int] = None
    allow_local_urls: Optional[bool] = None
    default_export_format: Optional[str] = None
    theme_preference: Optional[str] = None
    retry_count: Optional[int] = None
    max_pages: Optional[int] = None
    max_depth: Optional[int] = None
    request_delay: Optional[float] = None
    follow_pagination: Optional[bool] = None
    custom_headers: Optional[str] = None
