from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.log import LogResponse
from app.schemas.common import StandardResponse
from app.services.log_service import LogService
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/")
async def list_logs(
    skip: int = 0,
    limit: int = 100,
    level: str | None = None,
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    service = LogService(session)
    logs, total = await service.list_logs(skip=skip, limit=limit, level=level)
    return StandardResponse(
        data=[LogResponse.model_validate(l) for l in logs],
        message="Logs retrieved",
    )
