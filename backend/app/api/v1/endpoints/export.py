from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.export.export_service import ExportService
from app.services.history.history_service import HistoryService
from app.models.export_record import ExportRecord
from app.schemas.export import ExportRequest, ExportResponse, ExportFormat


router = APIRouter()


def _resolve_data_and_name(payload: ExportRequest, db: Session):
    history_service = HistoryService(db)
    data = None
    base_name = payload.base_name or "scrape_export"

    if payload.data:
        data = payload.data
        if "title" in data and data["title"]:
            base_name = str(data["title"])[:30]
    elif payload.job_id:
        job = history_service.get_job(payload.job_id)
        data = {c.data_type: c.data.get("value") for c in job.contents}
        data["target_url"] = job.target_url
        data["title"] = getattr(job, "pages", [None])[0].title if getattr(job, "pages", None) else ""
        base_name = f"scrape_{job.id[:8]}"
    elif payload.dataset_id:
        from app.services.datasets.dataset_service import DatasetService
        ds_service = DatasetService(db)
        dataset = ds_service.get_dataset(payload.dataset_id)
        if dataset.job_id:
            job = history_service.get_job(dataset.job_id)
            data = {c.data_type: c.data.get("value") for c in job.contents}
            data["target_url"] = job.target_url
        else:
            data = {"name": dataset.name, "description": dataset.description}
        base_name = dataset.name
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either job_id, dataset_id, or inline data.",
        )

    return data, base_name


@router.post("/", response_model=ExportResponse)
def trigger_export(
    payload: ExportRequest,
    db: Session = Depends(get_db),
):
    """Generates an export file for a job, dataset, or inline dataset."""
    export_service = ExportService(db)
    data, base_name = _resolve_data_and_name(payload, db)

    fmt = payload.format or ExportFormat.JSON
    if fmt == ExportFormat.EXCEL:
        fmt = ExportFormat.XLSX

    record = export_service.export_data(
        data=data,
        format_type=fmt,
        job_id=payload.job_id,
        dataset_id=payload.dataset_id,
        base_name=base_name,
        tab_type=payload.tab,
    )

    filename = Path(record.file_path).name
    return ExportResponse(
        export_id=record.id,
        format=record.format,
        file_name=filename,
        file_size_bytes=record.file_size_bytes,
        download_url=f"/api/v1/export/download/{record.id}",
        created_at=record.created_at,
    )


@router.post("/csv", response_model=ExportResponse)
def export_csv(payload: ExportRequest, db: Session = Depends(get_db)):
    payload.format = ExportFormat.CSV
    return trigger_export(payload, db)


@router.post("/json", response_model=ExportResponse)
def export_json(payload: ExportRequest, db: Session = Depends(get_db)):
    payload.format = ExportFormat.JSON
    return trigger_export(payload, db)


@router.post("/excel", response_model=ExportResponse)
@router.post("/xlsx", response_model=ExportResponse)
def export_excel(payload: ExportRequest, db: Session = Depends(get_db)):
    payload.format = ExportFormat.XLSX
    return trigger_export(payload, db)


@router.post("/txt", response_model=ExportResponse)
def export_txt(payload: ExportRequest, db: Session = Depends(get_db)):
    payload.format = ExportFormat.TXT
    return trigger_export(payload, db)


@router.post("/pdf", response_model=ExportResponse)
def export_pdf(payload: ExportRequest, db: Session = Depends(get_db)):
    payload.format = ExportFormat.PDF
    return trigger_export(payload, db)


@router.get("/download/{export_id}")
def download_export(
    export_id: str,
    db: Session = Depends(get_db),
):
    """Downloads a previously generated export file."""
    record = db.query(ExportRecord).filter(ExportRecord.id == export_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Export record not found.")

    file_path = Path(record.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File on disk not found.")

    record.download_count += 1
    db.commit()

    media_types = {
        "json": "application/json",
        "csv": "text/csv",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "pdf": "application/pdf",
        "txt": "text/plain",
    }

    return FileResponse(
        path=str(file_path),
        filename=file_path.name,
        media_type=media_types.get(record.format, "application/octet-stream"),
    )
