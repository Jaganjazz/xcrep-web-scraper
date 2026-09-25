from typing import Optional
from sqlalchemy.orm import Session
from app.models.settings import AppSetting
from app.core.config import settings
from app.schemas.settings import SettingsResponse, SettingsUpdateRequest


class SettingsService:
    """Service for managing application and user preferences."""

    def __init__(self, db: Session):
        self.db = db

    def get_settings(self) -> SettingsResponse:
        records = {s.key: s.value for s in self.db.query(AppSetting).all()}
        return SettingsResponse(
            user_agent=records.get("user_agent", settings.DEFAULT_USER_AGENT),
            request_timeout_seconds=int(records.get("request_timeout_seconds", settings.REQUEST_TIMEOUT_SECONDS)),
            max_concurrent_scrapes=int(records.get("max_concurrent_scrapes", settings.MAX_CONCURRENT_SCRAPES)),
            allow_local_urls=records.get("allow_local_urls", "false").lower() == "true",
            default_export_format=records.get("default_export_format", "json"),
            theme_preference=records.get("theme_preference", "dark"),
            retry_count=int(records.get("retry_count", 2)),
            max_pages=int(records.get("max_pages", 10)),
            max_depth=int(records.get("max_depth", 2)),
            request_delay=float(records.get("request_delay", 0.5)),
            follow_pagination=records.get("follow_pagination", "false").lower() == "true",
            custom_headers=records.get("custom_headers", ""),
        )

    def update_settings(self, updates: SettingsUpdateRequest) -> SettingsResponse:
        for field, value in updates.model_dump(exclude_unset=True).items():
            if value is not None:
                record = self.db.query(AppSetting).filter(AppSetting.key == field).first()
                if not record:
                    record = AppSetting(key=field, value=str(value))
                    self.db.add(record)
                else:
                    record.value = str(value)

        self.db.commit()
        return self.get_settings()
