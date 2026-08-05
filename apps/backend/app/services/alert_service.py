from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.device import Device


class AlertService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_alerts(
        self,
        skip: int = 0,
        limit: int = 100,
        level: str | None = None,
        device_id: int | None = None,
        organization_ids: set[int] | None = None,
    ) -> tuple[list[Alert], int]:
        query = select(Alert)
        count_query = select(func.count(Alert.id))

        if organization_ids is not None:
            query = query.join(Device, Device.id == Alert.device_id).where(
                Device.organization_id.in_(organization_ids)
            )
            count_query = count_query.join(Device, Device.id == Alert.device_id).where(
                Device.organization_id.in_(organization_ids)
            )

        if level:
            query = query.where(Alert.level == level)
            count_query = count_query.where(Alert.level == level)
        if device_id:
            query = query.where(Alert.device_id == device_id)
            count_query = count_query.where(Alert.device_id == device_id)

        query = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit)
        result = await self._session.execute(query)
        alerts = list(result.scalars().all())
        total = await self._session.scalar(count_query)

        return alerts, total or 0

    async def get_alert_organization_id(self, alert_id: int) -> int | None:
        result = await self._session.execute(
            select(Device.organization_id)
            .join(Alert, Alert.device_id == Device.id)
            .where(Alert.id == alert_id)
        )
        return result.scalar_one_or_none()

    async def acknowledge(self, alert_id: int) -> Alert | None:
        alert = await self._session.get(Alert, alert_id)
        if not alert:
            return None
        alert.acknowledged = True
        await self._session.commit()
        await self._session.refresh(alert)
        return alert

    async def acknowledge_all(self, organization_ids: set[int] | None = None) -> int:
        query = select(Alert).where(Alert.acknowledged == False)
        if organization_ids is not None:
            query = query.join(Device, Device.id == Alert.device_id).where(
                Device.organization_id.in_(organization_ids)
            )
        result = await self._session.execute(query)
        alerts = list(result.scalars().all())
        for alert in alerts:
            alert.acknowledged = True
        if alerts:
            await self._session.commit()
        return len(alerts)
