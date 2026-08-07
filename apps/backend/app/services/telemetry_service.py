from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device
from app.models.sample import Sample
from app.schemas.telemetry import TelemetrySampleCreate


class TelemetryService:
    """Ingestão de telemetria real (MQTT e HTTP) para a tabela ``samples``."""

    def __init__(self, session: AsyncSession):
        self._session = session

    async def resolve_device(
        self,
        serial_number: str | None = None,
        device_id: int | None = None,
        organization_ids: set[int] | None = None,
    ) -> Device | None:
        if device_id is not None:
            device = await self._session.get(Device, device_id)
        elif serial_number:
            result = await self._session.execute(
                select(Device).where(Device.serial_number == serial_number)
            )
            device = result.scalar_one_or_none()
        else:
            return None

        if not device:
            return None
        if organization_ids is not None and device.organization_id not in organization_ids:
            return None
        return device

    async def ingest_for_device(self, device: Device, data: TelemetrySampleCreate) -> Sample:
        sample = Sample(
            device_id=device.id,
            temperature=data.temperature,
            vibration_x=data.vibration_x,
            vibration_y=data.vibration_y,
            vibration_z=data.vibration_z,
            rms=data.rms,
            peak=data.peak,
            crest_factor=data.crest_factor,
            kurtosis=data.kurtosis,
            recorded_at=data.recorded_at
            or datetime.now(timezone.utc),
        )
        self._session.add(sample)
        await self._session.commit()
        await self._session.refresh(sample)
        return sample

    async def ingest(
        self,
        data: TelemetrySampleCreate,
        organization_ids: set[int] | None = None,
    ) -> Sample | None:
        device = await self.resolve_device(
            serial_number=data.serial_number,
            device_id=data.device_id,
            organization_ids=organization_ids,
        )
        if not device:
            return None
        return await self.ingest_for_device(device, data)
