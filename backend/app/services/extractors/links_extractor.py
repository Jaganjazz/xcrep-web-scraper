from typing import Dict, Any, List
from bs4 import BeautifulSoup
from app.services.extractors.base import BaseExtractor
from app.services.validation.url_validator import URLValidatorService
from app.utils.sanitizer import sanitize_text


class LinksExtractor(BaseExtractor):
    """Extracts internal and external hyperlinks with resolved absolute URLs."""

    @property
    def data_type(self) -> str:
        return "links"

    def extract(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        links: List[Dict[str, Any]] = []
        seen_urls = set()

        for a_tag in soup.find_all("a", href=True):
            raw_href = a_tag["href"].strip()
            if not raw_href or raw_href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue

            absolute_url = URLValidatorService.resolve_absolute_url(base_url, raw_href)
            if absolute_url in seen_urls:
                continue
            seen_urls.add(absolute_url)

            anchor_text = sanitize_text(a_tag.get_text()) or a_tag.get("title", "")
            is_external = not URLValidatorService.is_same_domain(base_url, absolute_url)
            rel_val = a_tag.get("rel")
            if isinstance(rel_val, list):
                rel_val = " ".join(rel_val)
            target_val = a_tag.get("target")

            links.append({
                "text": anchor_text,
                "url": absolute_url,
                "is_external": is_external,
                "rel": rel_val or "",
                "target": target_val or "",
            })

        return {
            "links": links,
            "item_count": len(links),
        }
