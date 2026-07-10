from datetime import datetime

from pydantic import BaseModel, Field


class SiteCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    location: str | None = Field(None, max_length=200)


class SiteUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    location: str | None = Field(None, max_length=200)
    active: bool | None = None


class SiteResponse(BaseModel):
    id: int
    uuid: str
    organization_id: int
    name: str
    location: str | None
    active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
