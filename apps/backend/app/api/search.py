from fastapi import APIRouter, Depends
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.services.auth_service import get_current_user
from app.models.user import User
from app.models.device import Device
from app.models.alert import Alert
from app.schemas.common import StandardResponse

router = APIRouter()


@router.get("/")
async def search(
    q: str = "",
    category: str | None = None,
    limit: int = 20,
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    term = f"%{q.strip()}%"
    results: list[dict] = []

    search_devices = category is None or category == "devices"
    search_alerts = category is None or category == "alarms"

    if q.strip() and search_devices:
        query = (
            select(Device)
            .where(
                or_(
                    Device.name.ilike(term),
                    Device.serial_number.ilike(term),
                    Device.firmware_version.ilike(term),
                    Device.location.ilike(term),
                )
            )
            .limit(limit)
        )
        devices = (await session.execute(query)).scalars().all()
        for d in devices:
            results.append(
                {
                    "id": f"device-{d.id}",
                    "category": "devices",
                    "categoryLabel": "Dispositivos",
                    "title": d.name,
                    "desc": d.serial_number,
                    "tags": ["Online" if d.active else "Offline"],
                    "metaInfo": f"{d.firmware_version} · {d.location or 'Sem local'}"
                    if d.firmware_version
                    else d.location or "Sem local",
                    "time": None,
                }
            )

    if q.strip() and search_alerts:
        query = (
            select(Alert, Device)
            .join(Device, Device.id == Alert.device_id)
            .where(
                or_(
                    Alert.alarm_type.ilike(term),
                    Device.name.ilike(term),
                    Device.serial_number.ilike(term),
                )
            )
            .order_by(Alert.created_at.desc())
            .limit(limit)
        )
        rows = (await session.execute(query)).all()
        for alert, device in rows:
            level_tag = {
                "critical": "Crítico",
                "error": "Erro",
                "warning": "Alto",
                "info": "Baixo",
            }.get(alert.level, alert.level)
            results.append(
                {
                    "id": f"alert-{alert.id}",
                    "category": "alarms",
                    "categoryLabel": "Alarmes",
                    "title": alert.alarm_type,
                    "desc": f"{device.name} · {device.serial_number}",
                    "tags": [level_tag],
                    "metaInfo": alert.created_at.strftime("%d/%m/%Y %H:%M"),
                    "time": None,
                }
            )

    return StandardResponse(data=results, message="Search results retrieved")
