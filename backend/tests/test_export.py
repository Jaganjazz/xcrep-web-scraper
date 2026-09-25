import os
import json
from pathlib import Path
from app.services.export.export_service import ExportService
from app.schemas.export import ExportFormat


def test_export_json(db_session):
    service = ExportService(db_session)
    data = {
        "title": "Test Scrape",
        "clean_text": "Sample clean text.",
        "links": [{"text": "Home", "url": "https://example.com"}],
    }
    record = service.export_data(data, ExportFormat.JSON, base_name="test_export")
    assert record.file_path.endswith(".json")
    path = Path(record.file_path)
    assert path.exists()
    with open(path, "r", encoding="utf-8") as f:
        loaded = json.load(f)
        assert loaded["title"] == "Test Scrape"


def test_export_csv(db_session):
    service = ExportService(db_session)
    data = {
        "links": [
            {"text": "Link 1", "url": "https://example.com/1", "is_external": False},
            {"text": "Link 2", "url": "https://example.com/2", "is_external": True},
        ]
    }
    record = service.export_data(data, ExportFormat.CSV, base_name="test_links")
    assert record.file_path.endswith(".csv")
    path = Path(record.file_path)
    assert path.exists()
    content = path.read_text(encoding="utf-8")
    assert "https://example.com/1" in content
    assert "https://example.com/2" in content


def test_export_xlsx(db_session):
    service = ExportService(db_session)
    data = {
        "title": "Excel Test",
        "links": [{"text": "Link A", "url": "https://example.com/a"}],
        "headings": [{"level": "h1", "text": "Heading 1"}],
        "emails": ["contact@example.com"],
    }
    record = service.export_data(data, ExportFormat.XLSX, base_name="test_sheets")
    assert record.file_path.endswith(".xlsx")
    assert Path(record.file_path).exists()
    assert record.file_size_bytes > 0


def test_export_txt(db_session):
    service = ExportService(db_session)
    data = {
        "title": "TXT Document",
        "clean_text": "Detailed readable text block.",
        "emails": ["user@example.com"],
    }
    record = service.export_data(data, ExportFormat.TXT, base_name="test_txt")
    assert record.file_path.endswith(".txt")
    path = Path(record.file_path)
    assert path.exists()
    content = path.read_text(encoding="utf-8")
    assert "Detailed readable text block." in content
    assert "user@example.com" in content


def test_export_pdf(db_session):
    service = ExportService(db_session)
    data = {
        "title": "PDF Document Summary",
        "target_url": "https://example.com",
        "clean_text": "Sample text summary for PDF report generation.",
        "emails": ["admin@example.com"],
    }
    record = service.export_data(data, ExportFormat.PDF, base_name="test_pdf")
    assert record.file_path.endswith(".pdf")
    path = Path(record.file_path)
    assert path.exists()
    assert path.stat().st_size > 100
