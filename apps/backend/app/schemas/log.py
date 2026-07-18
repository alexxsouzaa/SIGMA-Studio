from datetime import datetime

from pydantic import BaseModel


class LogResponse(BaseModel):
    id: int
    device_id: int | None
    user_id: int | None
    level: str
    source: str | None
    message: str
    details: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
