from datetime import datetime

from pydantic import BaseModel, Field


class FirmwareCreate(BaseModel):
    version: str = Field(..., max_length=20)
    description: str | None = Field(default=None)
    released_at: datetime | None = None


class FirmwareUpdate(BaseModel):
    version: str | None = Field(default=None, max_length=20)
    description: str | None = None
    released_at: datetime | None = None
    active: bool | None = None


class FirmwareResponse(BaseModel):
    id: int
    uuid: str
    version: str
    description: str | None
    released_at: datetime | None
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DeviceFirmwareStatus(BaseModel):
    device_id: int
    name: str
    current: str
    latest: str
    status: str
    progress: int
    date: str | None = None
