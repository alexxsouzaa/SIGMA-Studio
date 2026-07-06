from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.models.device import Device

router = APIRouter()


@router.get("/")
async def list_devices(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Device))
    devices = result.scalars().all()
    return devices


@router.get("/{device_id}")
async def get_device(device_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    return device
