import re
from typing import Dict, Any, List, Set
from bs4 import BeautifulSoup
from app.services.extractors.base import BaseExtractor
from app.utils.logger import logger


EMAIL_REGEX = re.compile(
    r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
    re.IGNORECASE,
)

IGNORED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".css", ".js", ".woff", ".woff2", ".ttf"
}


class EmailsExtractor(BaseExtractor):
    """Detects and extracts publicly visible email addresses from HTML text and mailto links."""

    @property
    def data_type(self) -> str:
        return "emails"

    def extract(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        found_emails: Set[str] = set()

        try:
            # 1. Search mailto: links
            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"].strip()
                if href.lower().startswith("mailto:"):
                    clean_email = href[7:].split("?")[0].strip().lower()
                    if self._is_valid_email(clean_email):
                        found_emails.add(clean_email)

            # 2. Search visible page text (excluding script and style tags)
            text_content = soup.get_text(separator=" ")
            matches = EMAIL_REGEX.findall(text_content)
            for email in matches:
                clean_email = email.strip().strip(".,;:()[]{}<>\"'").lower()
                if self._is_valid_email(clean_email):
                    found_emails.add(clean_email)

        except Exception as e:
            logger.warning(f"Error during email extraction: {str(e)}")

        email_list: List[str] = sorted(list(found_emails))
        return {
            "emails": email_list,
            "item_count": len(email_list),
        }

    def _is_valid_email(self, email: str) -> bool:
        if not email or "@" not in email or len(email) < 5 or len(email) > 254:
            return False
        # Discard false positives matching asset filenames like logo@2x.png
        lower_email = email.lower()
        if any(lower_email.endswith(ext) for ext in IGNORED_EXTENSIONS):
            return False
        # Must have valid domain portion with at least one dot
        domain = lower_email.split("@")[-1]
        if "." not in domain or domain.startswith(".") or domain.endswith("."):
            return False
        return True
