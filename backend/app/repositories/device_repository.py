from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device


class DeviceRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_all(self) -> list[Device]:
        result = await self._session.execute(select(Device))
        return list(result.scalars().all())

    async def get_by_id(self, device_id: int) -> Device | None:
        result = await self._session.execute(select(Device).where(Device.id == device_id))
        return result.scalar_one_or_none()

    async def create(self, device: Device) -> Device:
        self._session.add(device)
        await self._session.commit()
        await self._session.refresh(device)
        return device
