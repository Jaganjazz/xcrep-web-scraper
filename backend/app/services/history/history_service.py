import datetime
from typing import List, Tuple, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.models.job import ScrapingJob, JobStatus
from app.models.page import ScrapedPage
from app.models.content import ExtractedContent
from app.core.exceptions import JobNotFoundException
from app.schemas.scrape import ExtractionOptions


class HistoryService:
    """Service for persisting and querying scrape jobs, pages, and extracted payloads."""

    def __init__(self, db: Session):
        self.db = db

    def create_job(self, target_url: str, options: ExtractionOptions) -> ScrapingJob:
        job = ScrapingJob(
            target_url=target_url,
            status=JobStatus.PENDING.value,
            options=options.model_dump(),
            started_at=datetime.datetime.now(datetime.timezone.utc),
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def update_job_status(
        self,
        job_id: str,
        status: JobStatus,
        total_items: Optional[int] = None,
        pages_crawled: Optional[int] = None,
        pages_scraped: Optional[int] = None,
        error_message: Optional[str] = None,
        duration: Optional[float] = None,
        links_count: Optional[int] = None,
        images_count: Optional[int] = None,
        headings_count: Optional[int] = None,
        tables_count: Optional[int] = None,
        emails_count: Optional[int] = None,
        words_count: Optional[int] = None,
    ) -> ScrapingJob:
        job = self.get_job(job_id)
        job.status = status.value
        if total_items is not None:
            job.total_items = total_items
        if pages_crawled is not None:
            job.pages_crawled = pages_crawled
        if pages_scraped is not None:
            job.pages_scraped = pages_scraped
        if error_message is not None:
            job.error_message = error_message
        if duration is not None:
            job.duration = round(duration, 2)
        if links_count is not None:
            job.links_count = links_count
        if images_count is not None:
            job.images_count = images_count
        if headings_count is not None:
            job.headings_count = headings_count
        if tables_count is not None:
            job.tables_count = tables_count
        if emails_count is not None:
            job.emails_count = emails_count
        if words_count is not None:
            job.words_count = words_count

        if status in (JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED):
            job.completed_at = datetime.datetime.now(datetime.timezone.utc)
            if job.started_at and not duration:
                delta = (job.completed_at - job.started_at).total_seconds()
                job.duration = round(delta, 2)

        self.db.commit()
        self.db.refresh(job)
        return job

    def record_page_content(
        self,
        job_id: str,
        url: str,
        status_code: int,
        load_time_ms: float,
        extracted_data: Dict[str, Any],
        title: Optional[str] = None,
        depth: int = 1,
    ) -> ScrapedPage:
        resolved_title = title or extracted_data.get("title") or ""
        page = ScrapedPage(
            job_id=job_id,
            url=url,
            title=resolved_title,
            status="success" if status_code and status_code < 400 else "failed",
            response_code=status_code,
            load_time_ms=load_time_ms,
            depth=depth,
        )
        self.db.add(page)
        self.db.flush()

        # Save extracted content by category (including emails)
        categories = [
            ("title", extracted_data.get("title")),
            ("text", extracted_data.get("clean_text")),
            ("links", extracted_data.get("links")),
            ("images", extracted_data.get("images")),
            ("headings", extracted_data.get("headings")),
            ("tables", extracted_data.get("tables")),
            ("metadata", extracted_data.get("metadata")),
            ("emails", extracted_data.get("emails")),
            ("html", extracted_data.get("raw_html")),
        ]

        for cat_name, cat_val in categories:
            if cat_val is not None:
                item_count = 0
                if isinstance(cat_val, list):
                    item_count = len(cat_val)
                elif isinstance(cat_val, str) and cat_name == "text":
                    item_count = len(cat_val.split())
                elif cat_val:
                    item_count = 1

                content = ExtractedContent(
                    job_id=job_id,
                    page_id=page.id,
                    data_type=cat_name,
                    item_count=item_count,
                    data={"value": cat_val},
                )
                self.db.add(content)

        self.db.commit()
        self.db.refresh(page)
        return page

    def get_job(self, job_id: str) -> ScrapingJob:
        job = self.db.query(ScrapingJob).filter(ScrapingJob.id == job_id).first()
        if not job:
            raise JobNotFoundException(job_id)
        return job

    def list_jobs(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Tuple[List[ScrapingJob], int]:
        query = self.db.query(ScrapingJob)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    ScrapingJob.target_url.ilike(search_term),
                    ScrapingJob.id.ilike(search_term),
                )
            )
        if status and status.lower() != "all":
            query = query.filter(ScrapingJob.status == status.lower())

        total = query.count()
        jobs = query.order_by(desc(ScrapingJob.created_at)).offset(skip).limit(limit).all()
        return jobs, total

    def delete_job(self, job_id: str) -> bool:
        job = self.get_job(job_id)
        self.db.delete(job)
        self.db.commit()
        return True

    def clear_all_history(self) -> int:
        count = self.db.query(ScrapingJob).delete()
        self.db.commit()
        return count
