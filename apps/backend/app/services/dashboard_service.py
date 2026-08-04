from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device import Device
from app.models.alert import Alert
from app.models.gateway import Gateway
from app.models.ai_model import AIModel


class DashboardService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_summary(self, messages_per_minute: int = 0) -> dict:
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
            "messages_per_minute": messages_per_minute,
        }

    async def get_protocols(self) -> list[dict]:
        result = await self._session.execute(
            select(
                Gateway.protocol,
                func.count(Gateway.id).label("gateway_count"),
                func.coalesce(func.sum(Gateway.devices_count), 0).label("device_count"),
            )
            .group_by(Gateway.protocol)
            .order_by(func.sum(Gateway.devices_count).desc())
        )
        rows = result.all()
        total_devices = sum(r.device_count for r in rows) or 1
        return [
            {
                "name": r.protocol,
                "device_count": r.device_count,
                "gateway_count": r.gateway_count,
                "pct": round(r.device_count / total_devices * 100, 1),
            }
            for r in rows
        ]

    async def get_gateway_summary(self, limit: int = 4) -> list[dict]:
        result = await self._session.execute(
            select(Gateway)
            .order_by(Gateway.updated_at.desc())
            .limit(limit)
        )
        gateways = list(result.scalars().all())
        return [
            {"name": g.name, "protocol": g.protocol, "status": g.status}
            for g in gateways
        ]

    async def get_ai_insights(self) -> list[dict]:
        result = await self._session.execute(
            select(AIModel)
            .where(AIModel.active == True)
            .order_by(AIModel.updated_at.desc())
            .limit(5)
        )
        models = list(result.scalars().all())
        return [
            {
                "name": m.name,
                "type": m.type,
                "status": m.status,
                "accuracy": m.accuracy,
                "description": m.description,
            }
            for m in models
        ]
