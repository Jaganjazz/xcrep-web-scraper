from typing import Generator
from sqlalchemy.orm import Session
from app.core.database import get_db

# Re-export get_db for convenient dependency injection in route endpoints
__all__ = ["get_db"]
