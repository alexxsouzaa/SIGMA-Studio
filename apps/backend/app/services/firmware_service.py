from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.firmware import Firmware
from app.models.device import Device
from app.repositories.firmware_repository import FirmwareRepository
from app.schemas.firmware import FirmwareCreate, FirmwareUpdate


class FirmwareService:
    def __init__(self, repository: FirmwareRepository, session: AsyncSession):
        self._repository = repository
        self._session = session

    async def list_firmwares(
        self, skip: int = 0, limit: int = 100
    ) -> tuple[list[Firmware], int]:
        firmwares = await self._repository.list_all(skip=skip, limit=limit)
        total = await self._repository.count()
        return firmwares, total

    async def get_firmware(self, firmware_id: int) -> Firmware | None:
        return await self._repository.get_by_id(firmware_id)

    async def create_firmware(self, data: FirmwareCreate) -> Firmware:
        firmware = Firmware(
            version=data.version,
            description=data.description,
            released_at=data.released_at,
        )
        return await self._repository.create(firmware)

    async def update_firmware(
        self, firmware_id: int, data: FirmwareUpdate
    ) -> Firmware | None:
        firmware = await self._repository.get_by_id(firmware_id)
        if not firmware:
            return None
        update_data = data.model_dump(exclude_unset=True)
        return await self._repository.update(firmware, update_data)

    async def delete_firmware(self, firmware_id: int) -> bool:
        firmware = await self._repository.get_by_id(firmware_id)
        if not firmware:
            return False
        await self._repository.delete(firmware)
        return True

    async def device_status(self) -> list[dict]:
        result = await self._session.execute(select(Device))
        devices = list(result.scalars().all())
        latest = await self._repository.get_active_latest()
        latest_version = latest.version if latest else "1.0.0"

        rows = []
        for d in devices:
            current = d.firmware_version
            status = "current" if current == latest_version else "outdated"
            rows.append(
                {
                    "device_id": d.id,
                    "name": d.name,
                    "current": current,
                    "latest": latest_version,
                    "status": status,
                    "progress": 100 if status == "current" else 0,
                    "date": d.updated_at.strftime("%d/%m/%Y") if d.updated_at else None,
                }
            )
        return rows
