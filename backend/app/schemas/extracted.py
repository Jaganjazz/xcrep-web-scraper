from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class TitleItem(BaseModel):
    title: str


class TextContent(BaseModel):
    clean_text: str
    word_count: int


class LinkItem(BaseModel):
    text: str
    url: str
    is_external: bool


class ImageItem(BaseModel):
    src: str
    alt: Optional[str] = None
    width: Optional[str] = None
    height: Optional[str] = None


class HeadingItem(BaseModel):
    level: str  # h1, h2, h3, etc.
    text: str


class TableItem(BaseModel):
    headers: List[str]
    rows: List[List[str]]
    row_count: int


class MetadataItem(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    author: Optional[str] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image: Optional[str] = None
    canonical: Optional[str] = None
    favicon: Optional[str] = None


class ScrapeResultPayload(BaseModel):
    page_url: str
    status_code: int
    load_time_ms: float
    title: Optional[str] = None
    clean_text: Optional[str] = None
    word_count: int = 0
    links: List[LinkItem] = []
    images: List[ImageItem] = []
    headings: List[HeadingItem] = []
    tables: List[TableItem] = []
    metadata: Dict[str, Any] = {}
    raw_html: Optional[str] = None
