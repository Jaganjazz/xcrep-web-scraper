from typing import Optional
from urllib.parse import urlparse, urljoin
from app.core.security import validate_target_url


class URLValidatorService:
    """Service responsible for validating, normalizing, and resolving URLs."""

    @staticmethod
    def normalize_url(url: str) -> str:
        """Ensures the URL has a scheme (defaults to https://)."""
        if not url:
            return ""
        cleaned = url.strip()
        if not (cleaned.startswith("http://") or cleaned.startswith("https://")):
            cleaned = "https://" + cleaned
        return cleaned

    @staticmethod
    def is_valid_url(url: Optional[str]) -> bool:
        """Validates that a string is a well-formed HTTP/HTTPS URL."""
        if not url or not isinstance(url, str):
            return False
        cleaned = url.strip()
        if not (cleaned.startswith("http://") or cleaned.startswith("https://")):
            return False
        try:
            parsed = urlparse(cleaned)
            return bool(parsed.scheme in ("http", "https") and parsed.netloc and "." in parsed.netloc)
        except Exception:
            return False

    @staticmethod
    def validate_and_normalize(url: str) -> str:
        """Validates security compliance and returns normalized URL."""
        normalized = URLValidatorService.normalize_url(url)
        return validate_target_url(normalized)

    @staticmethod
    def is_same_domain(base_url: str, target_url: str) -> bool:
        """Determines whether two URLs belong to the same hostname."""
        try:
            base_domain = urlparse(base_url).netloc.lower()
            target_domain = urlparse(target_url).netloc.lower()
            return base_domain == target_domain
        except Exception:
            return False

    @staticmethod
    def resolve_absolute_url(base_url: str, relative_url: str) -> str:
        """Resolves relative URL strings against a base URL."""
        return urljoin(base_url, relative_url.strip())

