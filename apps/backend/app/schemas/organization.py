from datetime import datetime

from pydantic import BaseModel, Field


class OrganizationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=50)


class OrganizationUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    slug: str | None = Field(None, min_length=2, max_length=50)
    active: bool | None = None


class OrganizationResponse(BaseModel):
    id: int
    uuid: str
    name: str
    slug: str
    active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
