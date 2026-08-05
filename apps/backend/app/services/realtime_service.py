from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.sample import Sample


class RealtimeService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def recent_unacknowledged_alerts(self, limit: int = 50) -> list[Alert]:
        result = await self._session.execute(
            select(Alert)
            .where(Alert.acknowledged == False)
            .order_by(Alert.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def new_alerts_since(self, last_id: int, limit: int = 50) -> list[Alert]:
        result = await self._session.execute(
            select(Alert)
            .where(Alert.id > last_id)
            .order_by(Alert.id.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def new_samples_since(
        self,
        last_id: int,
        device_id: int | None = None,
        limit: int = 50,
    ) -> list[Sample]:
        query = select(Sample).where(Sample.id > last_id)
        if device_id is not None:
            query = query.where(Sample.device_id == device_id)
        query = query.order_by(Sample.id.asc()).limit(limit)
        result = await self._session.execute(query)
        return list(result.scalars().all())
