import pytest
from app.services.history.history_service import HistoryService
from app.services.datasets.dataset_service import DatasetService
from app.services.settings.settings_service import SettingsService
from app.schemas.scrape import ExtractionOptions
from app.schemas.dataset import DatasetCreate, DatasetUpdate
from app.schemas.settings import SettingsUpdateRequest
from app.models.job import JobStatus


def test_job_crud_lifecycle(db_session):
    service = HistoryService(db_session)
    options = ExtractionOptions(extract_all=True)

    # 1. Create Job
    job = service.create_job("https://example.com", options)
    assert job.id is not None
    assert job.status == JobStatus.PENDING.value

    # 2. Update status and metrics
    service.update_job_status(
        job.id,
        JobStatus.COMPLETED,
        total_items=25,
        pages_crawled=1,
        duration=1.45,
        links_count=10,
        images_count=5,
        headings_count=3,
        tables_count=1,
        emails_count=2,
        words_count=120,
    )
    retrieved = service.get_job(job.id)
    assert retrieved.status == JobStatus.COMPLETED.value
    assert retrieved.total_items == 25
    assert retrieved.duration == 1.45

    # 3. List and search
    jobs, total = service.list_jobs(search="example.com")
    assert total >= 1
    assert jobs[0].id == job.id

    # 4. Delete
    assert service.delete_job(job.id) is True


def test_dataset_crud(db_session):
    service = DatasetService(db_session)

    # 1. Create
    ds_data = DatasetCreate(
        name="Test Dataset",
        description="A curated dataset for testing.",
        tags=["unit-test", "qa"],
    )
    ds = service.create_dataset(ds_data, item_count="15 items")
    assert ds.id is not None
    assert ds.name == "Test Dataset"

    # 2. Update / Rename
    updated = service.update_dataset(ds.id, DatasetUpdate(name="Renamed Dataset"))
    assert updated.name == "Renamed Dataset"

    # 3. List
    datasets, total = service.list_datasets()
    assert total >= 1

    # 4. Delete
    assert service.delete_dataset(ds.id) is True


def test_settings_persistence(db_session):
    service = SettingsService(db_session)

    # Update settings
    updates = SettingsUpdateRequest(
        user_agent="CustomTestAgent/1.0",
        request_timeout_seconds=25,
        max_pages=15,
        retry_count=3,
    )
    saved = service.update_settings(updates)
    assert saved.user_agent == "CustomTestAgent/1.0"
    assert saved.request_timeout_seconds == 25
    assert saved.max_pages == 15
    assert saved.retry_count == 3
