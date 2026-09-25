from typing import Dict, Any, List
from bs4 import BeautifulSoup
from app.services.extractors.base import BaseExtractor
from app.utils.sanitizer import sanitize_text


class HeadingsExtractor(BaseExtractor):
    """Extracts heading hierarchy (H1, H2, H3, H4, H5, H6) in order of appearance."""

    @property
    def data_type(self) -> str:
        return "headings"

    def extract(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        headings: List[Dict[str, Any]] = []

        for tag in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"]):
            text = sanitize_text(tag.get_text())
            if text:
                headings.append({
                    "level": tag.name.lower(),
                    "text": text,
                })

        return {
            "headings": headings,
            "item_count": len(headings),
        }
