from bs4 import BeautifulSoup
from typing import Optional
from app.core.exceptions import ParserError
from app.utils.logger import logger


class HTMLParserService:
    """BeautifulSoup wrapper providing unified parsing and clean DOM access."""

    @staticmethod
    def parse(html: str) -> BeautifulSoup:
        """Parses HTML markup using lxml with fallback to html.parser."""
        if not html:
            return BeautifulSoup("", "html.parser")
        try:
            return BeautifulSoup(html, "lxml")
        except Exception as e:
            logger.warning(f"LXML parser failed, falling back to html.parser: {str(e)}")
            try:
                return BeautifulSoup(html, "html.parser")
            except Exception as inner_e:
                logger.error(f"HTML parsing completely failed: {str(inner_e)}")
                raise ParserError(f"Error parsing HTML: {str(inner_e)}")

    @staticmethod
    def clean_soup(soup: BeautifulSoup) -> BeautifulSoup:
        """Creates a clone with noisy/non-content tags stripped."""
        # Work on a copy so other extractors like raw HTML still work
        cloned = BeautifulSoup(str(soup), "html.parser")
        for tag in cloned(["script", "style", "noscript", "iframe", "svg", "path", "head"]):
            tag.decompose()
        return cloned
