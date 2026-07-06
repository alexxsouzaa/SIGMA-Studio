from datetime import datetime, timezone
from typing import Any, Generic, TypeVar
from uuid import uuid4

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T | None = None
    message: str = ""
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    request_id: str = Field(default_factory=lambda: uuid4().hex[:16])


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: dict[str, Any] | None = None
