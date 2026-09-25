from sqlalchemy import Column, String, Text, DateTime
import datetime
from app.core.database import Base


class AppSetting(Base):
    """Stores key-value system and user preferences."""
    __tablename__ = "app_settings"

    key = Column(String(128), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
