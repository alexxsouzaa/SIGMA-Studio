from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.repositories.firmware_repository import FirmwareRepository
from app.services.firmware_service import FirmwareService
from app.services.auth_service import get_current_user
from app.schemas.firmware import (
    FirmwareCreate,
    FirmwareUpdate,
    FirmwareResponse,
    DeviceFirmwareStatus,
)
from app.schemas.common import StandardResponse
from app.models.user import User

router = APIRouter()


def get_firmware_service(session: AsyncSession = Depends(get_session)) -> FirmwareService:
    repository = FirmwareRepository(session)
    return FirmwareService(repository, session)


@router.get("/")
async def list_firmwares(
    skip: int = 0,
    limit: int = 100,
    service: FirmwareService = Depends(get_firmware_service),
    _user: User = Depends(get_current_user),
):
    firmwares, total = await service.list_firmwares(skip=skip, limit=limit)
    return StandardResponse(
        data=[FirmwareResponse.model_validate(f) for f in firmwares],
        message="Firmwares retrieved successfully",
    )


@router.get("/status")
async def device_firmware_status(
    service: FirmwareService = Depends(get_firmware_service),
    _user: User = Depends(get_current_user),
):
    rows = await service.device_status()
    return StandardResponse(
        data=[DeviceFirmwareStatus.model_validate(r) for r in rows],
        message="Device firmware status retrieved",
    )


@router.post("/", status_code=201)
async def create_firmware(
    data: FirmwareCreate,
    service: FirmwareService = Depends(get_firmware_service),
    _user: User = Depends(get_current_user),
):
    firmware = await service.create_firmware(data)
    return StandardResponse(
        data=FirmwareResponse.model_validate(firmware),
        message="Firmware created successfully",
    )


@router.put("/{firmware_id}")
async def update_firmware(
    firmware_id: int,
    data: FirmwareUpdate,
    service: FirmwareService = Depends(get_firmware_service),
    _user: User = Depends(get_current_user),
):
    firmware = await service.update_firmware(firmware_id, data)
    if not firmware:
        raise HTTPException(status_code=404, detail="Firmware not found")
    return StandardResponse(
        data=FirmwareResponse.model_validate(firmware),
        message="Firmware updated successfully",
    )


@router.delete("/{firmware_id}")
async def delete_firmware(
    firmware_id: int,
    service: FirmwareService = Depends(get_firmware_service),
    _user: User = Depends(get_current_user),
):
    deleted = await service.delete_firmware(firmware_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Firmware not found")
    return StandardResponse(message="Firmware deleted successfully")
