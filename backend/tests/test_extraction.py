import pytest
from bs4 import BeautifulSoup
from app.services.scraping.html_parser import HTMLParserService
from app.services.extractors import ExtractionPipeline
from app.services.extractors.title_extractor import TitleExtractor
from app.services.extractors.text_extractor import TextExtractor
from app.services.extractors.links_extractor import LinksExtractor
from app.services.extractors.images_extractor import ImagesExtractor
from app.services.extractors.headings_extractor import HeadingsExtractor
from app.services.extractors.tables_extractor import TablesExtractor
from app.services.extractors.metadata_extractor import MetadataExtractor
from app.services.extractors.emails_extractor import EmailsExtractor
from app.schemas.scrape import ExtractionOptions


def test_title_extractor(sample_html):
    soup = HTMLParserService.parse(sample_html)
    res = TitleExtractor().extract(soup, "https://example.com")
    assert "Sample Test Article" in res["title"]
    assert res["item_count"] == 1


def test_clean_text_extractor(sample_html):
    soup = HTMLParserService.parse(sample_html)
    res = TextExtractor().extract(soup, "https://example.com")
    assert "first clean paragraph" in res["clean_text"]
    assert res["word_count"] > 10
    # Script/style must be excluded
    assert "<script>" not in res["clean_text"]


def test_links_extractor(sample_html):
    soup = HTMLParserService.parse(sample_html)
    res = LinksExtractor().extract(soup, "https://example.com")
    links = res["links"]
    assert len(links) >= 2

    # Check internal link
    internal = next((l for l in links if not l["is_external"]), None)
    assert internal is not None
    assert internal["url"] == "https://example.com/internal-page-1"
    assert internal["rel"] == "prev"

    # Check external link
    external = next((l for l in links if l["is_external"]), None)
    assert external is not None
    assert external["url"] == "https://external-domain.org/resource"
    assert external["target"] == "_blank"


def test_images_extractor(sample_html):
    soup = HTMLParserService.parse(sample_html)
    res = ImagesExtractor().extract(soup, "https://example.com")
    images = res["images"]
    assert len(images) >= 2
    banner = next(img for img in images if "banner.png" in img["src"])
    assert banner["src"] == "https://example.com/images/banner.png"
    assert banner["alt"] == "Test Banner Image"
    assert banner["title"] == "Banner Title"
    assert banner["loading"] == "lazy"


def test_headings_extractor(sample_html):
    soup = HTMLParserService.parse(sample_html)
    res = HeadingsExtractor().extract(soup, "https://example.com")
    headings = res["headings"]
    assert len(headings) >= 3
    assert any(h["level"] == "h1" and "Main Article Heading" in h["text"] for h in headings)
    assert any(h["level"] == "h2" and "Section Heading" in h["text"] for h in headings)
    assert any(h["level"] == "h3" and "Sub-section Heading" in h["text"] for h in headings)


def test_tables_extractor(sample_html):
    soup = HTMLParserService.parse(sample_html)
    res = TablesExtractor().extract(soup, "https://example.com")
    tables = res["tables"]
    assert len(tables) >= 1
    tbl = tables[0]
    assert tbl["headers"] == ["Item ID", "Product Name", "Price"]
    assert len(tbl["rows"]) == 2
    assert tbl["rows"][0] == ["101", "Web Scraper Pro", "$49.00"]


def test_metadata_extractor(sample_html):
    soup = HTMLParserService.parse(sample_html)
    res = MetadataExtractor().extract(soup, "https://example.com")
    meta = res["metadata"]
    assert "comprehensive test fixture" in meta["description"]
    assert "test, scraper" in meta["keywords"]
    assert meta["og_title"] == "OpenGraph Test Title"
    assert meta["canonical"] == "https://example.com/test-article"
    assert meta["favicon"] == "https://example.com/favicon.ico"


def test_emails_extractor(sample_html):
    soup = HTMLParserService.parse(sample_html)
    res = EmailsExtractor().extract(soup, "https://example.com")
    emails = res["emails"]
    assert "support@example.com" in emails
    assert "billing@testcorp.org" in emails
    assert "admin@example.com" in emails
    # Discard non-email files
    assert not any(e.endswith(".png") or e.endswith(".ico") for e in emails)


def test_malformed_html_and_missing_elements():
    malformed = "<div><p>Broken tag without closing <a href='/page'>Link<span></div>"
    soup = HTMLParserService.parse(malformed)
    pipeline = ExtractionPipeline()
    options = ExtractionOptions(extract_all=True)
    res = pipeline.run(soup, "https://example.com", malformed, options)

    assert res["clean_text"] != ""
    assert len(res["links"]) == 1
    assert res["links"][0]["url"] == "https://example.com/page"
    assert res["headings"] == []
    assert res["tables"] == []
    assert res["emails"] == []
    assert res["total_items"] >= 1
