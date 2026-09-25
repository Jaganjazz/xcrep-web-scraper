import uuid
from sqlalchemy import Column, String, ForeignKey, JSON, DateTime, Integer
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base


class ExtractedContent(Base):
    """Stores structured content extracted for a specific page and category."""
    __tablename__ = "extracted_contents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("scraping_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    page_id = Column(String(36), ForeignKey("scraped_pages.id", ondelete="CASCADE"), nullable=False, index=True)
    data_type = Column(String(64), nullable=False, index=True)  # title, text, links, images, headings, tables, metadata, html
    item_count = Column(Integer, default=0, nullable=False)
    data = Column(JSON, nullable=False)  # JSON payload containing extracted items
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    job = relationship("ScrapingJob", back_populates="contents")
    page = relationship("ScrapedPage", back_populates="contents")
