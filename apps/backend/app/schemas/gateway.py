from datetime import datetime

from pydantic import BaseModel, Field


class GatewayCreate(BaseModel):
    organization_id: int
    name: str = Field(..., max_length=100)
    protocol: str = Field(default="MQTT", max_length=50)
    endpoint: str | None = Field(default=None, max_length=255)
    status: str = Field(default="online", max_length=20)


class GatewayUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    protocol: str | None = Field(default=None, max_length=50)
    endpoint: str | None = Field(default=None, max_length=255)
    status: str | None = Field(default=None, max_length=20)
    devices_count: int | None = None
    active: bool | None = None


class GatewayResponse(BaseModel):
    id: int
    uuid: str
    organization_id: int
    name: str
    protocol: str
    endpoint: str | None
    status: str
    devices_count: int
    active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
