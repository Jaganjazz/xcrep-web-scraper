from typing import Dict, Any
from bs4 import BeautifulSoup
from app.services.extractors.base import BaseExtractor
from app.services.validation.url_validator import URLValidatorService
from app.utils.sanitizer import sanitize_text


class MetadataExtractor(BaseExtractor):
    """Extracts meta tags, OpenGraph, Twitter card data, and canonical link."""

    @property
    def data_type(self) -> str:
        return "metadata"

    def extract(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        meta: Dict[str, Any] = {}

        def get_meta(attr: str, val: str) -> str:
            tag = soup.find("meta", {attr: val})
            return tag.get("content", "") if tag else ""

        meta["title"] = get_meta("name", "title") or (soup.title.string if soup.title else "")
        meta["description"] = get_meta("name", "description")
        meta["keywords"] = get_meta("name", "keywords")
        meta["author"] = get_meta("name", "author")
        meta["viewport"] = get_meta("name", "viewport")

        # OpenGraph
        meta["og_title"] = get_meta("property", "og:title")
        meta["og_description"] = get_meta("property", "og:description")
        meta["og_type"] = get_meta("property", "og:type")
        meta["og_url"] = get_meta("property", "og:url")
        meta["og_image"] = get_meta("property", "og:image")

        # Twitter Card
        meta["twitter_card"] = get_meta("name", "twitter:card")
        meta["twitter_title"] = get_meta("name", "twitter:title")
        meta["twitter_description"] = get_meta("name", "twitter:description")

        # Canonical URL
        canonical_tag = soup.find("link", rel="canonical")
        meta["canonical"] = canonical_tag.get("href", "") if canonical_tag else ""

        # Favicon
        icon_tag = soup.find("link", rel=lambda x: x and "icon" in x.lower())
        if icon_tag and icon_tag.get("href"):
            meta["favicon"] = URLValidatorService.resolve_absolute_url(base_url, icon_tag["href"])
        else:
            meta["favicon"] = ""

        # Count non-empty values
        non_empty_count = sum(1 for v in meta.values() if v)

        return {
            "metadata": meta,
            "item_count": non_empty_count,
        }
