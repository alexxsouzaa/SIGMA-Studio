from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.device import Device
from app.models.sample import Sample


class RealtimeService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def recent_unacknowledged_alerts(
        self, limit: int = 50, organization_ids: set[int] | None = None
    ) -> list[Alert]:
        query = (
            select(Alert)
            .join(Device, Device.id == Alert.device_id)
            .where(Alert.acknowledged == False)
        )
        if organization_ids is not None:
            query = query.where(Device.organization_id.in_(organization_ids))
        query = query.order_by(Alert.created_at.desc()).limit(limit)
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def new_alerts_since(
        self,
        last_id: int,
        limit: int = 50,
        organization_ids: set[int] | None = None,
    ) -> list[Alert]:
        query = (
            select(Alert)
            .join(Device, Device.id == Alert.device_id)
            .where(Alert.id > last_id)
        )
        if organization_ids is not None:
            query = query.where(Device.organization_id.in_(organization_ids))
        query = query.order_by(Alert.id.asc()).limit(limit)
        result = await self._session.execute(query)
        return list(result.scalars().all())

    async def new_samples_since(
        self,
        last_id: int,
        device_id: int | None = None,
        limit: int = 50,
        organization_ids: set[int] | None = None,
    ) -> list[Sample]:
        query = select(Sample).where(Sample.id > last_id)
        if device_id is not None:
            query = query.where(Sample.device_id == device_id)
        if organization_ids is not None:
            query = (
                query.join(Device, Device.id == Sample.device_id)
                .where(Device.organization_id.in_(organization_ids))
            )
        query = query.order_by(Sample.id.asc()).limit(limit)
        result = await self._session.execute(query)
        return list(result.scalars().all())
