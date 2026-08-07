from datetime import datetime

from pydantic import BaseModel, Field


class DeviceCreate(BaseModel):
    organization_id: int
    site_id: int | None = None
    project_id: int | None = None
    name: str = Field(..., max_length=100)
    serial_number: str = Field(..., max_length=50)
    firmware_version: str = Field(default="1.0.0", max_length=20)
    location: str | None = Field(default=None, max_length=200)
    is_emulated: bool = False


class DeviceUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    firmware_version: str | None = Field(default=None, max_length=20)
    location: str | None = Field(default=None, max_length=200)
    site_id: int | None = None
    project_id: int | None = None
    active: bool | None = None
    is_emulated: bool | None = None


class DeviceResponse(BaseModel):
    id: int
    uuid: str
    organization_id: int
    site_id: int | None
    project_id: int | None
    name: str
    serial_number: str
    firmware_version: str
    location: str | None
    active: bool
    is_emulated: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
