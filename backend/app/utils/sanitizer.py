import html
import re
from typing import Optional


def sanitize_text(text: Optional[str]) -> str:
    """Removes irregular whitespace, unescapes HTML entities, and strips non-printable chars."""
    if not text:
        return ""
    # Unescape HTML entities (e.g. &amp; -> &)
    text = html.unescape(text)
    # Replace multiple whitespaces/newlines with single space
    text = re.sub(r"\s+", " ", text)
    # Strip leading/trailing whitespaces
    return text.strip()


def sanitize_filename(filename: str) -> str:
    """Ensures a string is safe for filesystem filename usage."""
    # Remove invalid filename characters
    clean = re.sub(r'[\\/*?:"<>|]', "", filename)
    clean = clean.replace(" ", "_")
    return clean[:100] or "export"
