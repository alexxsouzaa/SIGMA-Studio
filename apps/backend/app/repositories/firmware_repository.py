from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.firmware import Firmware


class FirmwareRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[Firmware]:
        result = await self._session.execute(
            select(Firmware).order_by(Firmware.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id(self, firmware_id: int) -> Firmware | None:
        result = await self._session.execute(
            select(Firmware).where(Firmware.id == firmware_id)
        )
        return result.scalar_one_or_none()

    async def get_active_latest(self) -> Firmware | None:
        result = await self._session.execute(
            select(Firmware)
            .where(Firmware.active == True)
            .order_by(Firmware.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def count(self) -> int:
        result = await self._session.execute(select(func.count(Firmware.id)))
        return result.scalar() or 0

    async def create(self, firmware: Firmware) -> Firmware:
        self._session.add(firmware)
        await self._session.commit()
        await self._session.refresh(firmware)
        return firmware

    async def update(self, firmware: Firmware, data: dict) -> Firmware:
        for key, value in data.items():
            setattr(firmware, key, value)
        await self._session.commit()
        await self._session.refresh(firmware)
        return firmware

    async def delete(self, firmware: Firmware) -> None:
        await self._session.delete(firmware)
        await self._session.commit()
