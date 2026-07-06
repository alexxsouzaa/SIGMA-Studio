from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.repositories.device_repository import DeviceRepository
from app.services.device_service import DeviceService
from app.schemas.device import DeviceCreate, DeviceUpdate, DeviceResponse
from app.schemas.common import StandardResponse, PaginationMeta

router = APIRouter()


def get_device_service(session: AsyncSession = Depends(get_session)) -> DeviceService:
    repository = DeviceRepository(session)
    return DeviceService(repository)


@router.get("/")
async def list_devices(
    skip: int = 0,
    limit: int = 100,
    service: DeviceService = Depends(get_device_service),
):
    devices, total = await service.list_devices(skip=skip, limit=limit)
    return StandardResponse(
        data=[DeviceResponse.model_validate(d) for d in devices],
        message="Devices retrieved successfully",
        request_id="",
    )


@router.get("/{device_id}")
async def get_device(
    device_id: int,
    service: DeviceService = Depends(get_device_service),
):
    device = await service.get_device(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return StandardResponse(
        data=DeviceResponse.model_validate(device),
        message="Device retrieved successfully",
    )


@router.post("/", status_code=201)
async def create_device(
    data: DeviceCreate,
    service: DeviceService = Depends(get_device_service),
):
    device = await service.create_device(data)
    return StandardResponse(
        data=DeviceResponse.model_validate(device),
        message="Device created successfully",
    )


@router.put("/{device_id}")
async def update_device(
    device_id: int,
    data: DeviceUpdate,
    service: DeviceService = Depends(get_device_service),
):
    device = await service.update_device(device_id, data)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return StandardResponse(
        data=DeviceResponse.model_validate(device),
        message="Device updated successfully",
    )


@router.delete("/{device_id}")
async def delete_device(
    device_id: int,
    service: DeviceService = Depends(get_device_service),
):
    deleted = await service.delete_device(device_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Device not found")
    return StandardResponse(message="Device deleted successfully")
