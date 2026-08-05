from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.database.session import get_session
from app.schemas.log import LogResponse
from app.schemas.common import StandardResponse
from app.services.log_service import LogService
from app.api.deps import require_permission, org_scope
from app.models.user import User

router = APIRouter()


@router.get("/")
async def list_logs(
    skip: int = 0,
    limit: int = 100,
    level: str | None = None,
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(require_permission("logs")),
    scope: set[int] | None = Depends(org_scope),
):
    service = LogService(session)
    logs, total = await service.list_logs(
        skip=skip, limit=limit, level=level, organization_ids=scope
    )
    return StandardResponse(
        data=[LogResponse.model_validate(l) for l in logs],
        message="Logs retrieved",
    )


@router.delete("/")
async def clear_logs(
    session: AsyncSession = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    service = LogService(session)
    deleted = await service.clear_logs()
    return StandardResponse(
        data={"deleted": deleted},
        message="Logs cleared",
    )
