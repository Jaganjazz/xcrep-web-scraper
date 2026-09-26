# xcrep — Production Web Scraper Application

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![Frontend: React + Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb.svg)](https://vitejs.dev)
[![Engine: BeautifulSoup4](https://img.shields.io/badge/Engine-BeautifulSoup4-00e5a3.svg)](https://www.crummy.com/software/BeautifulSoup/)

> **"Extract. Explore. Analyze."**  
> A professional, service-oriented web scraping platform engineered to extract, explore, and analyze data from websites in seconds. Designed with a dark SaaS aesthetic (charcoal, obsidian, emerald, cyan, and subtle gold) and built with real, production-ready backend services.

---

## Key Features

- **DOM Extraction Engine**: Built on Python + BeautifulSoup4 with 9 extraction modules:
  - **Page Title**: Automated title normalization and cleanup.
  - **Clean Text**: Strips `<script>`, `<style>`, and `<noscript>`, extracting readable content with word/character counts.
  - **Hyperlinks**: Captures target URL, anchor text, link type (internal/external), `rel`, and `target`.
  - **Images**: Extracts source URLs, alt descriptions, titles, and `loading` attributes.
  - **Headings**: Gathers semantic `h1`, `h2`, and `h3` hierarchy.
  - **Structured Tables**: Parses HTML tables into structured header and row matrices.
  - **Metadata**: Extracts description, keywords, OpenGraph (`og:title`, `og:image`), canonical links, and favicons.
  - **Public Emails**: Scans text and `mailto:` links for public email addresses, filtering out false positives.
  - **Raw HTML Source**: Safely captures raw markup without frontend execution risks.
- **Enterprise Security & SSRF Protection**:
  - Blocks loopback (`127.0.0.0/8`, `::1`), RFC 1918 private subnets, cloud metadata addresses (`169.254.169.254`), and internal domain suffixes (`.local`, `.internal`).
  - Strict protocol enforcement: Only `http://` and `https://` are permitted.
  - Multi-hop redirect validation prevents SSRF via 301/302 redirection.
  - Response size limit (15 MB) guards against memory exhaustion attacks.
- **Robots.txt Engine**: Fetches, parses, and caches domain `robots.txt` rules (1-hour in-memory TTL) and enforces user-agent permissions (`allowed`, `restricted`, `blocked`).
- **Multi-Page Crawler**: BFS queue crawler supporting depth controls (1–3), page limits (1–20), same-domain restriction, request delays, and automated next-page pagination discovery.
- **Real-Time Stage Pipeline**: Real status tracking (`validating` → `robots` → `fetching` → `extracting` → `persisting` → `completed`).
- **Comprehensive Results Workspace**: 9-tab dashboard with live text search, table sorting, one-click clipboard copying, and direct dataset saving.
- **Multi-Format Export Suite**:
  - **CSV**: Structured tabular exports for links, tables, headings, or metadata.
  - **JSON**: Complete structured hierarchical payloads.
  - **Excel (XLSX)**: Multi-sheet workbook (`Overview`, `Links`, `Images`, `Headings`, `Tables`, `Emails`, `Metadata`).
  - **TXT**: Formatted, human-readable text document.
  - **PDF**: Professional styled report generated with ReportLab containing banner headers, statistics, and text samples.
- **Persistence & History**: SQLite backend via SQLAlchemy ORM tracking job runs, duration, page metrics, item counts, and error states with full CRUD.
- **Saved Datasets**: Name, tag, preview, filter, and export persistent collections.
- **User & Crawler Settings**: Configurable default timeouts, user agents, custom headers, page limits, and one-click history purging.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Lucide React, Vanilla CSS Design System |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic V2, SQLAlchemy |
| **Scraping Engine**| BeautifulSoup4, lxml, HTTPX (async & sync safe clients) |
| **Exports** | Pandas, OpenPyXL, ReportLab |
| **Database** | SQLite with connection pooling and automated migration |
| **Testing** | Pytest, FastAPI TestClient, AnyIO |

---

## Project Structure

```
xcrep/
├── IMPLEMENTATION_STATUS.md     # Phase tracking & verification matrix
├── SECURITY.md                  # Threat model & security controls
├── README.md                    # Project documentation
├── backend/
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment configuration template
│   ├── app/
│   │   ├── main.py              # FastAPI application, middleware & lifespan
│   │   ├── core/                # Configuration, DB engine & SSRF security
│   │   ├── models/              # SQLAlchemy models (Jobs, Pages, Datasets, Settings)
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # Scraping, crawl, robots, export, history services
│   │   ├── api/v1/              # REST API endpoints (/scrape, /history, /export, etc.)
│   │   └── utils/               # Sanitizers, logger, and file managers
│   ├── data/                    # SQLite database & export storage
│   └── tests/                   # Pytest test suite (32 unit & integration tests)
└── frontend/
    ├── package.json             # NPM dependencies
    ├── vite.config.js           # Vite dev & build configuration
    ├── index.html               # Entry HTML
    └── src/
        ├── App.jsx              # Main view router & shell
        ├── index.css            # Dark glassmorphism design tokens & styles
        ├── api/                 # Axios-based API client layer
        ├── context/             # Global ScrapeContext & ThemeContext
        ├── components/          # Reusable UI, dashboard & results components
        └── pages/               # Dashboard, Scrape, History, SavedData, Export, Settings
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18 or newer
- **Python**: v3.11, 3.12, or 3.13
- **Pip**: Latest version

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional but recommended)
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Start FastAPI development server
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Swagger documentation is accessible at: `http://localhost:8000/docs`  
API Health Check endpoint: `http://localhost:8000/api/health`

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## API Endpoints

### Scraping Operations
- `POST /api/scrape` — Execute single-page or multi-page crawling job.
- `POST /api/scrape/validate-url` — Validate URL safety, SSRF check, and inspect `robots.txt`.

### History & Scrapes
- `GET /api/scrapes/` or `GET /api/history/` — List past scraping jobs with search & status filters.
- `GET /api/scrapes/{job_id}` — Retrieve full details, metrics, and extracted items for a job.
- `DELETE /api/scrapes/{job_id}` — Delete a specific job record.
- `DELETE /api/history/clear/all` — Purge all scrape history.

### Saved Datasets
- `GET /api/datasets/` — List all saved datasets.
- `POST /api/datasets/` — Save a scraping result into a named dataset.
- `GET /api/datasets/{id}` — Retrieve dataset payload and preview.
- `DELETE /api/datasets/{id}` — Delete a saved dataset.

### Direct Multi-Format Exports
- `POST /api/export/csv` — Export data payload to structured CSV.
- `POST /api/export/json` — Export data payload to JSON.
- `POST /api/export/excel` — Export data payload to multi-sheet Excel workbook.
- `POST /api/export/txt` — Export data payload to formatted text.
- `POST /api/export/pdf` — Export data payload to styled PDF report.
- `GET /api/export/download/{export_id}` — Download generated export file.

### Settings & System Health
- `GET /api/settings/` — Fetch current user and scraper preferences.
- `PUT /api/settings/` — Update scraper timeouts, user-agent, or crawler depth.
- `GET /api/health` — System status and version check.

---

## Running Automated Tests

The backend includes a comprehensive 32-test suite covering SSRF protection, URL validation, extractor fidelity, multi-format exports, database transactions, and API endpoints.

```bash
# From workspace root
PYTHONPATH=backend python3 -m pytest backend/tests/ -v
```

To run a production frontend build check:
```bash
cd frontend
npm run build
```

---

## Keyboard Shortcuts
- `Ctrl + K` or `Cmd + K`: Open Global Search modal anywhere in the dashboard.
- `Esc`: Close open modals or overlays.

---

## Production Deployment Checklist
1. Set `DEBUG=False` in `backend/.env`.
2. Update `CORS_ORIGINS` to point exclusively to your production frontend domain.
3. Build the frontend (`npm run build`) and serve static assets via Nginx or Cloudflare Pages.
4. Run FastAPI using a production ASGI supervisor (e.g., `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app`).
5. Ensure the `backend/data/` directory is mapped to a persistent volume.

