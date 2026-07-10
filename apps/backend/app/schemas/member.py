from datetime import datetime

from pydantic import BaseModel


class MemberResponse(BaseModel):
    id: int
    user_id: int
    organization_id: int
    role_id: int
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
