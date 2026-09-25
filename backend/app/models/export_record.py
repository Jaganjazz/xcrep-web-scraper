import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base


class ExportRecord(Base):
    """Tracks files generated for export (CSV, JSON, XLSX, PDF, TXT)."""
    __tablename__ = "export_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String(36), ForeignKey("scraping_jobs.id", ondelete="CASCADE"), nullable=True, index=True)
    dataset_id = Column(String(36), ForeignKey("saved_datasets.id", ondelete="CASCADE"), nullable=True, index=True)
    format = Column(String(16), nullable=False)  # csv, json, xlsx, pdf, txt
    file_path = Column(String(1024), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    download_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    job = relationship("ScrapingJob", back_populates="exports")
    dataset = relationship("SavedDataset", back_populates="exports")
