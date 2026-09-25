import uuid
import datetime
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class ScrapedPage(Base):
    """Represents an individual page visited during a scraping or crawl task."""
    __tablename__ = "scraped_pages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("scraping_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(2048), nullable=False)
    title = Column(String(512), nullable=True)
    status = Column(String(32), default="success", nullable=False)
    response_code = Column(Integer, nullable=True)
    depth = Column(Integer, default=1, nullable=False)
    load_time_ms = Column(Float, nullable=True)
    content_type = Column(String(128), nullable=True)
    scraped_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    job = relationship("ScrapingJob", back_populates="pages")
    contents = relationship("ExtractedContent", back_populates="page", cascade="all, delete-orphan")
