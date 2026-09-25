import uuid
from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class SavedDataset(Base, TimestampMixin):
    """Represents a saved or curated dataset created from scraping jobs."""
    __tablename__ = "saved_datasets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    tags = Column(JSON, default=list, nullable=False)
    job_id = Column(String(36), ForeignKey("scraping_jobs.id", ondelete="SET NULL"), nullable=True)
    item_count = Column(String(64), default="0 items", nullable=False)
    
    # Relationships
    exports = relationship("ExportRecord", back_populates="dataset", cascade="all, delete-orphan")
