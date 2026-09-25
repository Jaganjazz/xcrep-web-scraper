import pytest
from app.services.validation.url_validator import URLValidatorService
from app.core.exceptions import InvalidURLException, SecurityViolationException


def test_valid_urls():
    valid_cases = [
        ("https://example.com", "https://example.com"),
        ("http://example.org/path/page.html", "http://example.org/path/page.html"),
        ("https://sub.domain.co.uk:8080/query?q=search#hash", "https://sub.domain.co.uk:8080/query?q=search#hash"),
        ("https://books.toscrape.com", "https://books.toscrape.com"),
    ]
    for raw, expected in valid_cases:
        assert URLValidatorService.is_valid_url(raw) is True
        normalized = URLValidatorService.normalize_url(raw)
        assert normalized.startswith("http")


def test_missing_protocol_normalization():
    # Automatically prepend https://
    url = "news.ycombinator.com/item?id=12345"
    normalized = URLValidatorService.normalize_url(url)
    assert normalized.startswith("https://news.ycombinator.com")
    assert URLValidatorService.is_valid_url(normalized) is True


def test_invalid_urls():
    invalid_cases = [
        "",
        "   ",
        None,
        "not_a_valid_url_at_all",
        "http://",
        "https://",
    ]
    for bad in invalid_cases:
        assert URLValidatorService.is_valid_url(bad) is False


def test_unsupported_protocols():
    unsupported = [
        "ftp://ftp.example.com/file.zip",
        "file:///etc/passwd",
        "javascript:alert(1)",
        "data:text/html,<html></html>",
        "gopher://gopher.floodgap.com",
    ]
    for proto in unsupported:
        assert URLValidatorService.is_valid_url(proto) is False
        with pytest.raises(InvalidURLException):
            URLValidatorService.validate_and_normalize(proto)
