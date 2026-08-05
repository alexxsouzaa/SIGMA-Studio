from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.alert import AlertResponse
from app.schemas.common import StandardResponse
from app.services.alert_service import AlertService
from app.api.deps import require_permission, org_scope, can_access_org
from app.models.user import User

router = APIRouter()


@router.get("/")
async def list_alerts(
    skip: int = 0,
    limit: int = 100,
    level: str | None = None,
    device_id: int | None = None,
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(require_permission("alarms")),
    scope: set[int] | None = Depends(org_scope),
):
    service = AlertService(session)
    alerts, total = await service.list_alerts(
        skip=skip,
        limit=limit,
        level=level,
        device_id=device_id,
        organization_ids=scope,
    )
    return StandardResponse(
        data=[AlertResponse.model_validate(a) for a in alerts],
        message="Alerts retrieved",
    )


@router.post("/acknowledge-all")
async def acknowledge_all_alerts(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(require_permission("alarms")),
    scope: set[int] | None = Depends(org_scope),
):
    service = AlertService(session)
    count = await service.acknowledge_all(organization_ids=scope)
    return StandardResponse(
        data={"acknowledged": count},
        message=f"{count} alerts acknowledged",
    )


@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: int,
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(require_permission("alarms")),
    scope: set[int] | None = Depends(org_scope),
):
    service = AlertService(session)
    org_id = await service.get_alert_organization_id(alert_id)
    if org_id is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    if not can_access_org(scope, org_id):
        raise HTTPException(status_code=403, detail="Access denied")
    alert = await service.acknowledge(alert_id)
    return StandardResponse(
        data=AlertResponse.model_validate(alert),
        message="Alert acknowledged",
    )
