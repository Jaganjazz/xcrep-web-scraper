from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.history.history_service import HistoryService
from app.schemas.job import JobSummary, JobDetailResponse, JobListResponse
from app.core.exceptions import JobNotFoundException

router = APIRouter()


@router.get("/", response_model=JobListResponse)
def list_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    """Lists past scraping jobs with pagination, search, and status filtering."""
    service = HistoryService(db)
    skip = (page - 1) * page_size
    jobs, total = service.list_jobs(skip=skip, limit=page_size, search=search, status=status_filter)

    job_summaries = [
        JobSummary(
            id=j.id,
            target_url=j.target_url,
            status=j.status,
            total_items=j.total_items,
            pages_crawled=j.pages_crawled,
            pages_scraped=getattr(j, "pages_scraped", j.pages_crawled),
            duration=getattr(j, "duration", 0.0),
            links_count=getattr(j, "links_count", 0),
            images_count=getattr(j, "images_count", 0),
            headings_count=getattr(j, "headings_count", 0),
            tables_count=getattr(j, "tables_count", 0),
            emails_count=getattr(j, "emails_count", 0),
            words_count=getattr(j, "words_count", 0),
            created_at=j.created_at,
            updated_at=j.updated_at,
            error_message=j.error_message,
        )
        for j in jobs
    ]

    return JobListResponse(
        jobs=job_summaries,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.delete("/clear-all", status_code=status.HTTP_200_OK)
def clear_history(db: Session = Depends(get_db)):
    """Clears all scraping history records from database."""
    service = HistoryService(db)
    count = service.clear_all_history()
    return {"message": f"Successfully deleted {count} history records.", "deleted_count": count}


@router.get("/{job_id}", response_model=Dict[str, Any])
def get_job_detail(
    job_id: str,
    db: Session = Depends(get_db),
):
    """Retrieves full details and extracted content for a specific scraping job."""
    service = HistoryService(db)
    try:
        job = service.get_job(job_id)
        # Group contents by data_type
        extracted: Dict[str, Any] = {}
        for content in job.contents:
            key = content.data_type
            if key == "text":
                extracted["clean_text"] = content.data.get("value", "")
            elif key == "html":
                extracted["raw_html"] = content.data.get("value", "")
            else:
                extracted[key] = content.data.get("value")

        return {
            "id": job.id,
            "target_url": job.target_url,
            "status": job.status,
            "total_items": job.total_items,
            "pages_crawled": job.pages_crawled,
            "pages_scraped": getattr(job, "pages_scraped", job.pages_crawled),
            "duration": getattr(job, "duration", 0.0),
            "links_count": getattr(job, "links_count", 0),
            "images_count": getattr(job, "images_count", 0),
            "headings_count": getattr(job, "headings_count", 0),
            "tables_count": getattr(job, "tables_count", 0),
            "emails_count": getattr(job, "emails_count", 0),
            "words_count": getattr(job, "words_count", 0),
            "created_at": job.created_at,
            "options": job.options,
            "results": extracted,
        }
    except JobNotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: str,
    db: Session = Depends(get_db),
):
    """Deletes a scraping job and all related stored payloads."""
    service = HistoryService(db)
    try:
        service.delete_job(job_id)
        return None
    except JobNotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)
