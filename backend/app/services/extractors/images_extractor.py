from typing import Dict, Any, List
from bs4 import BeautifulSoup
from app.services.extractors.base import BaseExtractor
from app.services.validation.url_validator import URLValidatorService
from app.utils.sanitizer import sanitize_text


class ImagesExtractor(BaseExtractor):
    """Extracts image elements with resolved absolute source, alt text, and dimensions."""

    @property
    def data_type(self) -> str:
        return "images"

    def extract(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        images: List[Dict[str, Any]] = []
        seen_srcs = set()

        for img in soup.find_all("img"):
            raw_src = img.get("src") or img.get("data-src") or img.get("srcset", "").split(" ")[0]
            if not raw_src:
                continue

            absolute_src = URLValidatorService.resolve_absolute_url(base_url, raw_src.strip())
            if absolute_src in seen_srcs:
                continue
            seen_srcs.add(absolute_src)

            images.append({
                "src": absolute_src,
                "alt": sanitize_text(img.get("alt", "")),
                "title": sanitize_text(img.get("title", "")),
                "loading": img.get("loading", ""),
                "width": img.get("width"),
                "height": img.get("height"),
            })

        return {
            "images": images,
            "item_count": len(images),
        }
