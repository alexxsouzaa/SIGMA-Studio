from datetime import datetime

from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: int
    device_id: int
    alarm_type: str
    level: str
    value: float | None
    threshold: float | None
    acknowledged: bool
    created_at: datetime

    model_config = {"from_attributes": True}
