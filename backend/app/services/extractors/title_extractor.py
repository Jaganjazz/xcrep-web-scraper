from typing import Dict, Any
from bs4 import BeautifulSoup
from app.services.extractors.base import BaseExtractor
from app.utils.sanitizer import sanitize_text


class TitleExtractor(BaseExtractor):
    """Extracts page title with multiple fallbacks (title tag, og:title, h1)."""

    @property
    def data_type(self) -> str:
        return "title"

    def extract(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        title = ""
        
        # 1. Standard <title>
        if soup.title and soup.title.string:
            title = soup.title.string
        
        # 2. OpenGraph og:title
        if not title:
            og_title = soup.find("meta", property="og:title")
            if og_title and og_title.get("content"):
                title = og_title["content"]

        # 3. First <h1> tag
        if not title:
            h1 = soup.find("h1")
            if h1:
                title = h1.get_text()

        cleaned_title = sanitize_text(title)
        return {
            "title": cleaned_title,
            "item_count": 1 if cleaned_title else 0,
        }
