from datetime import datetime

from pydantic import BaseModel, Field


class AIModelCreate(BaseModel):
    name: str = Field(..., max_length=100)
    type: str = Field(default="anomaly", max_length=50)
    framework: str = Field(default="TinyML", max_length=50)
    accuracy: float = 0.0
    latency: float = 0.0
    f1: float = 0.0
    device: str | None = Field(default=None, max_length=100)
    size: str | None = Field(default=None, max_length=20)
    description: str | None = None


class AIModelUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    type: str | None = Field(default=None, max_length=50)
    framework: str | None = Field(default=None, max_length=50)
    status: str | None = Field(default=None, max_length=20)
    accuracy: float | None = None
    latency: float | None = None
    f1: float | None = None
    device: str | None = Field(default=None, max_length=100)
    size: str | None = Field(default=None, max_length=20)
    description: str | None = None
    active: bool | None = None


class AIModelResponse(BaseModel):
    id: int
    uuid: str
    name: str
    type: str
    framework: str
    status: str
    accuracy: float
    latency: float
    f1: float
    device: str | None
    size: str | None
    description: str | None
    active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
