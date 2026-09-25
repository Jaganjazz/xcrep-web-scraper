import uuid
import datetime
from sqlalchemy import Column, String, Integer, Float, Text, JSON, DateTime
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base
from app.models.base import TimestampMixin


class JobStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScrapingJob(Base, TimestampMixin):
    """Represents a discrete scraping or crawling job."""
    __tablename__ = "scraping_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    target_url = Column(String(2048), nullable=False, index=True)
    status = Column(String(32), default=JobStatus.PENDING.value, index=True, nullable=False)
    options = Column(JSON, default=dict, nullable=False)  # Scrape options, extract types
    total_items = Column(Integer, default=0, nullable=False)
    pages_crawled = Column(Integer, default=0, nullable=False)
    pages_scraped = Column(Integer, default=0, nullable=False)
    
    # Statistical counters
    links_count = Column(Integer, default=0, nullable=False)
    images_count = Column(Integer, default=0, nullable=False)
    headings_count = Column(Integer, default=0, nullable=False)
    tables_count = Column(Integer, default=0, nullable=False)
    emails_count = Column(Integer, default=0, nullable=False)
    words_count = Column(Integer, default=0, nullable=False)
    
    # Execution timing
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration = Column(Float, default=0.0, nullable=False)  # in seconds
    
    error_message = Column(Text, nullable=True)

    # Relationships
    pages = relationship("ScrapedPage", back_populates="job", cascade="all, delete-orphan")
    contents = relationship("ExtractedContent", back_populates="job", cascade="all, delete-orphan")
    exports = relationship("ExportRecord", back_populates="job", cascade="all, delete-orphan")
