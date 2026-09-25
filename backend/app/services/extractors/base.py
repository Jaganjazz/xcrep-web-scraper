from abc import ABC, abstractmethod
from typing import Any, Dict
from bs4 import BeautifulSoup


class BaseExtractor(ABC):
    """Abstract base class for all data-type specific extractors."""

    @property
    @abstractmethod
    def data_type(self) -> str:
        """Returns the unique identifier string for this extractor (e.g., 'title', 'links')."""
        pass

    @abstractmethod
    def extract(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        """Performs extraction from the parsed BeautifulSoup DOM."""
        pass
