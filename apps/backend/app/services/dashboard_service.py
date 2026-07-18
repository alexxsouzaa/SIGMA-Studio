from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device
from app.models.alert import Alert


class DashboardService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_summary(self) -> dict:
        total_devices = await self._session.scalar(
            select(func.count(Device.id))
        )
        active_devices = await self._session.scalar(
            select(func.count(Device.id)).where(Device.active == True)
        )
        inactive_devices = await self._session.scalar(
            select(func.count(Device.id)).where(Device.active == False)
        )
        total_alerts = await self._session.scalar(
            select(func.count(Alert.id))
        )
        active_alerts = await self._session.scalar(
            select(func.count(Alert.id)).where(Alert.acknowledged == False)
        )
        critical_alerts = await self._session.scalar(
            select(func.count(Alert.id)).where(
                Alert.level == "critical", Alert.acknowledged == False
            )
        )

        return {
            "total_devices": total_devices or 0,
            "active_devices": active_devices or 0,
            "inactive_devices": inactive_devices or 0,
            "total_alerts": total_alerts or 0,
            "active_alerts": active_alerts or 0,
            "critical_alerts": critical_alerts or 0,
        }
