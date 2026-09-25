from typing import Dict, Any, List
from bs4 import BeautifulSoup
from app.services.extractors.base import BaseExtractor
from app.services.extractors.title_extractor import TitleExtractor
from app.services.extractors.text_extractor import TextExtractor
from app.services.extractors.links_extractor import LinksExtractor
from app.services.extractors.images_extractor import ImagesExtractor
from app.services.extractors.headings_extractor import HeadingsExtractor
from app.services.extractors.tables_extractor import TablesExtractor
from app.services.extractors.metadata_extractor import MetadataExtractor
from app.services.extractors.emails_extractor import EmailsExtractor
from app.schemas.scrape import ExtractionOptions


class ExtractionPipeline:
    """Orchestrates individual extractors based on user-selected extraction options."""

    def __init__(self):
        self.extractors: Dict[str, BaseExtractor] = {
            "title": TitleExtractor(),
            "text": TextExtractor(),
            "links": LinksExtractor(),
            "images": ImagesExtractor(),
            "headings": HeadingsExtractor(),
            "tables": TablesExtractor(),
            "metadata": MetadataExtractor(),
            "emails": EmailsExtractor(),
        }

    def run(self, soup: BeautifulSoup, base_url: str, raw_html: str, options: ExtractionOptions) -> Dict[str, Any]:
        results: Dict[str, Any] = {}
        total_items = 0

        # Always extract title as basic identity
        title_res = self.extractors["title"].extract(soup, base_url)
        results["title"] = title_res.get("title", "")
        total_items += title_res.get("item_count", 0)

        # Text
        if options.extract_all or options.text:
            text_res = self.extractors["text"].extract(soup, base_url)
            results["clean_text"] = text_res.get("clean_text", "")
            results["word_count"] = text_res.get("word_count", 0)
            total_items += text_res.get("word_count", 0)

        # Links
        if options.extract_all or options.links:
            links_res = self.extractors["links"].extract(soup, base_url)
            results["links"] = links_res.get("links", [])
            total_items += links_res.get("item_count", 0)

        # Images
        if options.extract_all or options.images:
            images_res = self.extractors["images"].extract(soup, base_url)
            results["images"] = images_res.get("images", [])
            total_items += images_res.get("item_count", 0)

        # Headings
        if options.extract_all or options.headings:
            headings_res = self.extractors["headings"].extract(soup, base_url)
            results["headings"] = headings_res.get("headings", [])
            total_items += headings_res.get("item_count", 0)

        # Tables
        if options.extract_all or options.tables:
            tables_res = self.extractors["tables"].extract(soup, base_url)
            results["tables"] = tables_res.get("tables", [])
            total_items += tables_res.get("item_count", 0)

        # Metadata
        if options.extract_all or options.metadata:
            meta_res = self.extractors["metadata"].extract(soup, base_url)
            results["metadata"] = meta_res.get("metadata", {})
            total_items += meta_res.get("item_count", 0)

        # Emails
        if options.extract_all or getattr(options, "emails", False):
            emails_res = self.extractors["emails"].extract(soup, base_url)
            results["emails"] = emails_res.get("emails", [])
            total_items += emails_res.get("item_count", 0)

        # Raw HTML Source
        if options.extract_all or options.html:
            results["raw_html"] = raw_html

        results["total_items"] = total_items
        return results


__all__ = [
    "BaseExtractor",
    "TitleExtractor",
    "TextExtractor",
    "LinksExtractor",
    "ImagesExtractor",
    "HeadingsExtractor",
    "TablesExtractor",
    "MetadataExtractor",
    "EmailsExtractor",
    "ExtractionPipeline",
]
