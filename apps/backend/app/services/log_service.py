from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.log import Log


class LogService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_logs(
        self, skip: int = 0, limit: int = 100, level: str | None = None
    ) -> tuple[list[Log], int]:
        query = select(Log)
        count_query = select(func.count(Log.id))

        if level:
            query = query.where(Log.level == level)
            count_query = count_query.where(Log.level == level)

        query = query.order_by(Log.created_at.desc()).offset(skip).limit(limit)
        result = await self._session.execute(query)
        logs = list(result.scalars().all())
        total = await self._session.scalar(count_query)

        return logs, total or 0

    async def create_log(
        self, level: str, source: str, message: str,
        device_id: int | None = None, user_id: int | None = None,
    ) -> Log:
        log = Log(
            level=level, source=source, message=message,
            device_id=device_id, user_id=user_id,
        )
        self._session.add(log)
        await self._session.commit()
        await self._session.refresh(log)
        return log

    async def clear_logs(self) -> int:
        total = await self._session.scalar(func.count(Log.id)) or 0
        await self._session.execute(Log.__table__.delete())
        await self._session.commit()
        return total
