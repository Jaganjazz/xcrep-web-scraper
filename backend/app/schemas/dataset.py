from typing import List, Optional
import datetime
from pydantic import BaseModel, Field


class DatasetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    tags: List[str] = []
    job_id: Optional[str] = None


class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class DatasetResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    tags: List[str]
    job_id: Optional[str]
    item_count: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
