from enum import Enum
from typing import Optional, List, Dict, Any
import datetime
from pydantic import BaseModel, Field


class ExportFormat(str, Enum):
    CSV = "csv"
    JSON = "json"
    XLSX = "xlsx"
    EXCEL = "excel"
    PDF = "pdf"
    TXT = "txt"


class ExportRequest(BaseModel):
    job_id: Optional[str] = None
    dataset_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    tab: Optional[str] = None
    format: Optional[ExportFormat] = ExportFormat.JSON
    base_name: Optional[str] = "scrape_export"
    include_types: Optional[List[str]] = None


class ExportResponse(BaseModel):
    export_id: str
    format: str
    file_name: str
    file_size_bytes: int
    download_url: str
    created_at: datetime.datetime
