from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device


class DeviceRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_all(
        self,
        skip: int = 0,
        limit: int = 100,
        organization_ids: set[int] | None = None,
        is_emulated: bool | None = None,
    ) -> list[Device]:
        query = select(Device)
        if organization_ids is not None:
            query = query.where(Device.organization_id.in_(organization_ids))
        if is_emulated is not None:
            query = query.where(Device.is_emulated == is_emulated)
        result = await self._session.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def get_by_id(self, device_id: int) -> Device | None:
        result = await self._session.execute(
            select(Device).where(Device.id == device_id)
        )
        return result.scalar_one_or_none()

    async def get_by_uuid(self, device_uuid: str) -> Device | None:
        result = await self._session.execute(
            select(Device).where(Device.uuid == device_uuid)
        )
        return result.scalar_one_or_none()

    async def count(
        self,
        organization_ids: set[int] | None = None,
        is_emulated: bool | None = None,
    ) -> int:
        query = select(func.count(Device.id))
        if organization_ids is not None:
            query = query.where(Device.organization_id.in_(organization_ids))
        if is_emulated is not None:
            query = query.where(Device.is_emulated == is_emulated)
        result = await self._session.execute(query)
        return result.scalar() or 0

    async def create(self, device: Device) -> Device:
        self._session.add(device)
        await self._session.commit()
        await self._session.refresh(device)
        return device

    async def update(self, device: Device, data: dict) -> Device:
        for key, value in data.items():
            setattr(device, key, value)
        await self._session.commit()
        await self._session.refresh(device)
        return device

    async def delete(self, device: Device) -> None:
        await self._session.delete(device)
        await self._session.commit()
