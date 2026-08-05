from app.models.device import Device
from app.repositories.device_repository import DeviceRepository
from app.schemas.device import DeviceCreate, DeviceUpdate


class DeviceService:
    def __init__(self, repository: DeviceRepository):
        self._repository = repository

    async def list_devices(
        self,
        skip: int = 0,
        limit: int = 100,
        organization_ids: set[int] | None = None,
    ) -> tuple[list[Device], int]:
        devices = await self._repository.list_all(
            skip=skip, limit=limit, organization_ids=organization_ids
        )
        total = await self._repository.count(organization_ids=organization_ids)
        return devices, total

    async def get_device(self, device_id: int) -> Device | None:
        return await self._repository.get_by_id(device_id)

    async def create_device(self, data: DeviceCreate) -> Device:
        device = Device(
            name=data.name,
            serial_number=data.serial_number,
            firmware_version=data.firmware_version,
            location=data.location,
            organization_id=data.organization_id,
            site_id=data.site_id,
            project_id=data.project_id,
        )
        return await self._repository.create(device)

    async def update_device(self, device_id: int, data: DeviceUpdate) -> Device | None:
        device = await self._repository.get_by_id(device_id)
        if not device:
            return None
        update_data = data.model_dump(exclude_unset=True)
        return await self._repository.update(device, update_data)

    async def delete_device(self, device_id: int) -> bool:
        device = await self._repository.get_by_id(device_id)
        if not device:
            return False
        await self._repository.delete(device)
        return True
