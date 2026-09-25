from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.dataset import SavedDataset
from app.schemas.dataset import DatasetCreate, DatasetUpdate
from app.core.exceptions import DatasetNotFoundException


class DatasetService:
    """Service for managing curated and saved datasets."""

    def __init__(self, db: Session):
        self.db = db

    def create_dataset(self, data: DatasetCreate, item_count: str = "0 items") -> SavedDataset:
        dataset = SavedDataset(
            name=data.name,
            description=data.description,
            tags=data.tags,
            job_id=data.job_id,
            item_count=item_count,
        )
        self.db.add(dataset)
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def get_dataset(self, dataset_id: str) -> SavedDataset:
        dataset = self.db.query(SavedDataset).filter(SavedDataset.id == dataset_id).first()
        if not dataset:
            raise DatasetNotFoundException(dataset_id)
        return dataset

    def list_datasets(self, skip: int = 0, limit: int = 50) -> Tuple[List[SavedDataset], int]:
        query = self.db.query(SavedDataset).order_by(desc(SavedDataset.created_at))
        total = query.count()
        datasets = query.offset(skip).limit(limit).all()
        return datasets, total

    def update_dataset(self, dataset_id: str, data: DatasetUpdate) -> SavedDataset:
        dataset = self.get_dataset(dataset_id)
        if data.name is not None:
            dataset.name = data.name
        if data.description is not None:
            dataset.description = data.description
        if data.tags is not None:
            dataset.tags = data.tags
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def delete_dataset(self, dataset_id: str) -> bool:
        dataset = self.get_dataset(dataset_id)
        self.db.delete(dataset)
        self.db.commit()
        return True

    def clear_all_datasets(self) -> int:
        count = self.db.query(SavedDataset).delete()
        self.db.commit()
        return count

