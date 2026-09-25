import json
import uuid
import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
import pandas as pd
from app.models.export_record import ExportRecord
from app.schemas.export import ExportFormat
from app.utils.file_manager import get_export_file_path
from app.utils.sanitizer import sanitize_filename
from app.utils.logger import logger


class ExportService:
    """Service to serialize and format extracted scrape payloads into downloadable formats."""

    def __init__(self, db: Session):
        self.db = db

    def export_data(
        self,
        data: Dict[str, Any],
        format_type: ExportFormat,
        job_id: Optional[str] = None,
        dataset_id: Optional[str] = None,
        base_name: str = "scrape_export",
        tab_type: Optional[str] = None,
    ) -> ExportRecord:
        clean_base = sanitize_filename(base_name)
        timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d_%H%M%S")
        suffix = f"_{tab_type}" if tab_type else ""
        ext = "xlsx" if format_type == ExportFormat.XLSX else format_type.value
        filename = f"{clean_base}{suffix}_{timestamp}.{ext}"
        target_path = get_export_file_path(filename)

        # Dispatch formatting
        if format_type == ExportFormat.JSON:
            self._write_json(data, target_path, tab_type)
        elif format_type == ExportFormat.CSV:
            self._write_csv(data, target_path, tab_type)
        elif format_type == ExportFormat.XLSX:
            self._write_xlsx(data, target_path, tab_type)
        elif format_type == ExportFormat.TXT:
            self._write_txt(data, target_path, tab_type)
        elif format_type == ExportFormat.PDF:
            self._write_pdf(data, target_path, tab_type)
        else:
            self._write_json(data, target_path, tab_type)

        file_size = target_path.stat().st_size if target_path.exists() else 0

        # Create record in DB
        record = ExportRecord(
            job_id=job_id,
            dataset_id=dataset_id,
            format=format_type.value,
            file_path=str(target_path),
            file_size_bytes=file_size,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        logger.info(f"Generated {format_type.value.upper()} export: {filename} ({file_size} bytes)")
        return record

    def _write_json(self, data: Dict[str, Any], path: Path, tab_type: Optional[str] = None):
        payload = data
        if tab_type and tab_type in data:
            payload = {
                "target_url": data.get("target_url", ""),
                "title": data.get("title", ""),
                "tab": tab_type,
                "data": data[tab_type],
            }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

    def _write_csv(self, data: Dict[str, Any], path: Path, tab_type: Optional[str] = None):
        # Specific tab requested
        if tab_type == "links" and "links" in data and isinstance(data["links"], list):
            df = pd.DataFrame(data["links"])
        elif tab_type == "images" and "images" in data and isinstance(data["images"], list):
            df = pd.DataFrame(data["images"])
        elif tab_type == "headings" and "headings" in data and isinstance(data["headings"], list):
            df = pd.DataFrame(data["headings"])
        elif tab_type == "emails" and "emails" in data and isinstance(data["emails"], list):
            df = pd.DataFrame({"email": data["emails"]})
        elif tab_type == "tables" and "tables" in data and data["tables"]:
            tbl = data["tables"][0]
            df = pd.DataFrame(tbl.get("rows", []), columns=tbl.get("headers", None))
        elif tab_type == "metadata" and "metadata" in data and isinstance(data["metadata"], dict):
            df = pd.DataFrame([{"key": k, "value": v} for k, v in data["metadata"].items()])
        elif "links" in data and isinstance(data["links"], list) and data["links"]:
            df = pd.DataFrame(data["links"])
        elif "tables" in data and isinstance(data["tables"], list) and data["tables"]:
            tbl = data["tables"][0]
            df = pd.DataFrame(tbl.get("rows", []), columns=tbl.get("headers", None))
        else:
            # Flatten summary fields
            rows = []
            for k, v in data.items():
                if isinstance(v, (str, int, float, bool)):
                    rows.append({"Property": k, "Value": str(v)})
                elif isinstance(v, list):
                    rows.append({"Property": k, "Value": f"List of {len(v)} items"})
            df = pd.DataFrame(rows if rows else [{"Property": "Status", "Value": "Empty"}])
        df.to_csv(path, index=False, encoding="utf-8")

    def _write_xlsx(self, data: Dict[str, Any], path: Path, tab_type: Optional[str] = None):
        with pd.ExcelWriter(path, engine="openpyxl") as writer:
            written_sheets = 0

            # Overview Sheet
            overview_rows = [
                {"Key": "Target URL", "Value": str(data.get("target_url", "N/A"))},
                {"Key": "Page Title", "Value": str(data.get("title", "N/A"))},
                {"Key": "Export Date", "Value": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")},
                {"Key": "Total Links", "Value": str(len(data.get("links", [])))},
                {"Key": "Total Images", "Value": str(len(data.get("images", [])))},
                {"Key": "Total Headings", "Value": str(len(data.get("headings", [])))},
                {"Key": "Total Tables", "Value": str(len(data.get("tables", [])))},
                {"Key": "Total Emails", "Value": str(len(data.get("emails", [])))},
                {"Key": "Word Count", "Value": str(data.get("word_count", len(data.get("clean_text", "").split())))},
            ]
            pd.DataFrame(overview_rows).to_excel(writer, sheet_name="Overview", index=False)
            written_sheets += 1

            if "links" in data and data["links"]:
                pd.DataFrame(data["links"]).to_excel(writer, sheet_name="Links", index=False)
                written_sheets += 1
            if "images" in data and data["images"]:
                pd.DataFrame(data["images"]).to_excel(writer, sheet_name="Images", index=False)
                written_sheets += 1
            if "headings" in data and data["headings"]:
                pd.DataFrame(data["headings"]).to_excel(writer, sheet_name="Headings", index=False)
                written_sheets += 1
            if "emails" in data and data["emails"]:
                pd.DataFrame({"Email": data["emails"]}).to_excel(writer, sheet_name="Emails", index=False)
                written_sheets += 1
            if "metadata" in data and data["metadata"]:
                meta_rows = [{"Key": k, "Value": str(v)} for k, v in data["metadata"].items()]
                pd.DataFrame(meta_rows).to_excel(writer, sheet_name="Metadata", index=False)
                written_sheets += 1
            if "tables" in data and data["tables"]:
                for i, tbl in enumerate(data["tables"][:3]):
                    tbl_df = pd.DataFrame(tbl.get("rows", []), columns=tbl.get("headers", None))
                    sheet_title = f"Table_{i+1}"
                    tbl_df.to_excel(writer, sheet_name=sheet_title, index=False)
                    written_sheets += 1

    def _write_txt(self, data: Dict[str, Any], path: Path, tab_type: Optional[str] = None):
        with open(path, "w", encoding="utf-8") as f:
            f.write("==================================================\n")
            f.write("WEB SCRAPER DATA EXPORT\n")
            f.write("==================================================\n\n")
            f.write(f"URL: {data.get('target_url', 'N/A')}\n")
            f.write(f"Title: {data.get('title', 'N/A')}\n")
            f.write(f"Generated: {datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n")

            if data.get("clean_text"):
                f.write("--- EXTRACTED CLEAN TEXT ---\n")
                f.write(data["clean_text"])
                f.write("\n\n")

            if data.get("emails"):
                f.write(f"--- EXTRACTED EMAILS ({len(data['emails'])}) ---\n")
                for email in data["emails"]:
                    f.write(f"- {email}\n")
                f.write("\n")

            if data.get("headings"):
                f.write(f"--- HEADINGS ({len(data['headings'])}) ---\n")
                for h in data["headings"]:
                    f.write(f"[{h.get('level', '').upper()}] {h.get('text', '')}\n")
                f.write("\n")

            if data.get("links"):
                f.write(f"--- HYPERLINKS ({len(data['links'])}) ---\n")
                for link in data["links"]:
                    f.write(f"{link.get('text', '(No text)')} -> {link.get('url', '')}\n")
                f.write("\n")

            if data.get("images"):
                f.write(f"--- IMAGES ({len(data['images'])}) ---\n")
                for img in data["images"]:
                    f.write(f"Alt: {img.get('alt', 'None')} | URL: {img.get('src', '')}\n")
                f.write("\n")

    def _write_pdf(self, data: Dict[str, Any], path: Path, tab_type: Optional[str] = None):
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.pdfgen import canvas

            c = canvas.Canvas(str(path), pagesize=letter)
            page_w, page_h = letter

            # Header Banner
            c.setFillColor(colors.HexColor("#06090e"))
            c.rect(0, page_h - 90, page_w, 90, fill=True, stroke=False)
            
            c.setFillColor(colors.HexColor("#00e5a3"))
            c.setFont("Helvetica-Bold", 20)
            c.drawString(40, page_h - 45, "Web Scraper Report")
            c.setFont("Helvetica", 10)
            c.setFillColor(colors.HexColor("#94a3b8"))
            c.drawString(40, page_h - 68, "Extract. Explore. Analyze. - Professional Data Payload")

            y = page_h - 120
            c.setFillColor(colors.HexColor("#1e293b"))
            c.setFont("Helvetica-Bold", 12)
            c.drawString(40, y, "Metadata & Job Overview")
            y -= 20

            c.setFont("Helvetica", 9)
            c.setFillColor(colors.HexColor("#334155"))
            c.drawString(40, y, f"Target URL: {data.get('target_url', 'N/A')[:75]}")
            y -= 15
            c.drawString(40, y, f"Page Title: {data.get('title', 'N/A')[:75]}")
            y -= 15
            c.drawString(40, y, f"Export Timestamp: {datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")
            y -= 25

            # Summary Stats
            c.setFont("Helvetica-Bold", 11)
            c.setFillColor(colors.HexColor("#1e293b"))
            c.drawString(40, y, "Summary Statistics")
            y -= 18

            stats_str = (
                f"Links: {len(data.get('links', []))} | "
                f"Images: {len(data.get('images', []))} | "
                f"Headings: {len(data.get('headings', []))} | "
                f"Tables: {len(data.get('tables', []))} | "
                f"Emails: {len(data.get('emails', []))} | "
                f"Words: {len(data.get('clean_text', '').split())}"
            )
            c.setFont("Helvetica", 9)
            c.drawString(40, y, stats_str)
            y -= 30

            # Content preview
            c.setFont("Helvetica-Bold", 11)
            c.drawString(40, y, "Text Content Preview")
            y -= 18

            c.setFont("Helvetica", 8)
            c.setFillColor(colors.HexColor("#475569"))
            text_lines = data.get("clean_text", "").splitlines()
            for line in text_lines[:35]:
                clean_line = line.strip()
                if not clean_line:
                    continue
                if y < 60:
                    c.showPage()
                    y = page_h - 60
                    c.setFont("Helvetica", 8)
                    c.setFillColor(colors.HexColor("#475569"))
                c.drawString(40, y, clean_line[:105])
                y -= 13

            # List Emails if present
            if data.get("emails"):
                if y < 100:
                    c.showPage()
                    y = page_h - 60
                y -= 15
                c.setFont("Helvetica-Bold", 11)
                c.setFillColor(colors.HexColor("#1e293b"))
                c.drawString(40, y, f"Extracted Public Emails ({len(data['emails'])})")
                y -= 16
                c.setFont("Helvetica", 9)
                c.setFillColor(colors.HexColor("#059669"))
                for email in data["emails"][:15]:
                    c.drawString(40, y, f"• {email}")
                    y -= 14

            c.save()
        except Exception as e:
            logger.warning(f"ReportLab PDF generation error: {str(e)}. Writing basic text PDF.")
            with open(path, "wb") as f:
                f.write(b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\nxref\n0 3\ntrailer<</Size 3/Root 1 0 R>>\nstartxref\n99\n%%EOF")
