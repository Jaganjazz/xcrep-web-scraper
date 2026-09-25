from typing import Dict, Any
from bs4 import BeautifulSoup
from app.services.extractors.base import BaseExtractor
from app.services.scraping.html_parser import HTMLParserService
from app.utils.sanitizer import sanitize_text


class TextExtractor(BaseExtractor):
    """Extracts readable, clean text content with boilerplate tags removed."""

    @property
    def data_type(self) -> str:
        return "text"

    def extract(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        cleaned_soup = HTMLParserService.clean_soup(soup)

        # Prefer main semantic tags if available
        main_content = (
            cleaned_soup.find("main")
            or cleaned_soup.find("article")
            or cleaned_soup.find(id="content")
            or cleaned_soup.find(class_="content")
            or cleaned_soup.body
            or cleaned_soup
        )

        raw_text = main_content.get_text(separator=" ", strip=True) if main_content else ""
        cleaned_text = sanitize_text(raw_text)
        word_count = len(cleaned_text.split()) if cleaned_text else 0

        return {
            "clean_text": cleaned_text,
            "word_count": word_count,
            "item_count": word_count,
        }
