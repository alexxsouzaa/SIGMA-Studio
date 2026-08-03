from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.alert import AlertResponse
from app.schemas.common import StandardResponse
from app.services.alert_service import AlertService
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/")
async def list_alerts(
    skip: int = 0,
    limit: int = 100,
    level: str | None = None,
    device_id: int | None = None,
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    service = AlertService(session)
    alerts, total = await service.list_alerts(
        skip=skip, limit=limit, level=level, device_id=device_id
    )
    return StandardResponse(
        data=[AlertResponse.model_validate(a) for a in alerts],
        message="Alerts retrieved",
    )


@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: int,
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    service = AlertService(session)
    alert = await service.acknowledge(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return StandardResponse(
        data=AlertResponse.model_validate(alert),
        message="Alert acknowledged",
    )
