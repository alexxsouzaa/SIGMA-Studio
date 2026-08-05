from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_permission, org_scope
from app.database.session import get_session
from app.models.user import User
from app.schemas.common import StandardResponse
from app.schemas.telemetry import TelemetrySampleCreate, TelemetrySampleResponse
from app.services.telemetry_service import TelemetryService

router = APIRouter()


def get_telemetry_service(
    session: AsyncSession = Depends(get_session),
) -> TelemetryService:
    return TelemetryService(session)


@router.post("", status_code=201)
async def ingest_telemetry(
    data: TelemetrySampleCreate,
    service: TelemetryService = Depends(get_telemetry_service),
    _user: User = Depends(require_permission("telemetry")),
    scope: set[int] | None = Depends(org_scope),
):
    device = await service.resolve_device(
        serial_number=data.serial_number,
        device_id=data.device_id,
        organization_ids=scope,
    )
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    sample = await service.ingest_for_device(device, data)
    return StandardResponse(
        data=TelemetrySampleResponse.model_validate(sample),
        message="Telemetry sample ingested",
    )
