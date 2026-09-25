from typing import Dict, Any, List
from bs4 import BeautifulSoup
from app.services.extractors.base import BaseExtractor
from app.utils.sanitizer import sanitize_text


class TablesExtractor(BaseExtractor):
    """Detects and parses HTML tables into structured headers and row matrices."""

    @property
    def data_type(self) -> str:
        return "tables"

    def extract(self, soup: BeautifulSoup, base_url: str) -> Dict[str, Any]:
        tables: List[Dict[str, Any]] = []

        for table in soup.find_all("table"):
            th_elements = table.find_all("th")
            headers = [sanitize_text(th.get_text()) for th in th_elements]
            rows: List[List[str]] = []

            for tr in table.find_all("tr"):
                # If there are th headers and this row only contains th elements, it's the header row
                tds = tr.find_all("td")
                if not tds and headers:
                    continue
                cells = [sanitize_text(cell.get_text()) for cell in tr.find_all(["td", "th"])]
                if cells:
                    rows.append(cells)

            # If headers were empty, use first row if applicable
            if not headers and rows:
                headers = rows[0]
                rows = rows[1:]

            if rows or headers:
                tables.append({
                    "headers": headers,
                    "rows": rows,
                    "row_count": len(rows),
                })

        return {
            "tables": tables,
            "item_count": sum(t["row_count"] for t in tables),
        }

