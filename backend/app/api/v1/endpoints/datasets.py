from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.datasets.dataset_service import DatasetService
from app.schemas.dataset import DatasetCreate, DatasetUpdate, DatasetResponse
from app.core.exceptions import DatasetNotFoundException

router = APIRouter()


@router.get("/", response_model=List[DatasetResponse])
def list_datasets(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Lists saved datasets."""
    service = DatasetService(db)
    datasets, _ = service.list_datasets(skip=(page - 1) * page_size, limit=page_size)
    return datasets


@router.delete("/clear-all", status_code=status.HTTP_200_OK)
def clear_all_datasets(db: Session = Depends(get_db)):
    """Clears all saved datasets."""
    service = DatasetService(db)
    count = service.clear_all_datasets()
    return {"message": f"Successfully deleted {count} saved datasets.", "deleted_count": count}



@router.post("/", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def create_dataset(
    payload: DatasetCreate,
    db: Session = Depends(get_db),
):
    """Creates a new saved dataset entry."""
    service = DatasetService(db)
    return service.create_dataset(payload)


@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
):
    """Gets dataset metadata by ID."""
    service = DatasetService(db)
    try:
        return service.get_dataset(dataset_id)
    except DatasetNotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)


@router.put("/{dataset_id}", response_model=DatasetResponse)
def update_dataset(
    dataset_id: str,
    payload: DatasetUpdate,
    db: Session = Depends(get_db),
):
    """Updates dataset metadata."""
    service = DatasetService(db)
    try:
        return service.update_dataset(dataset_id, payload)
    except DatasetNotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
):
    """Deletes a saved dataset."""
    service = DatasetService(db)
    try:
        service.delete_dataset(dataset_id)
        return None
    except DatasetNotFoundException as e:
        raise HTTPException(status_code=404, detail=e.message)
