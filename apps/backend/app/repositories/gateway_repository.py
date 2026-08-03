from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gateway import Gateway


class GatewayRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[Gateway]:
        result = await self._session.execute(
            select(Gateway).order_by(Gateway.id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id(self, gateway_id: int) -> Gateway | None:
        result = await self._session.execute(
            select(Gateway).where(Gateway.id == gateway_id)
        )
        return result.scalar_one_or_none()

    async def count(self) -> int:
        result = await self._session.execute(select(func.count(Gateway.id)))
        return result.scalar() or 0

    async def create(self, gateway: Gateway) -> Gateway:
        self._session.add(gateway)
        await self._session.commit()
        await self._session.refresh(gateway)
        return gateway

    async def update(self, gateway: Gateway, data: dict) -> Gateway:
        for key, value in data.items():
            setattr(gateway, key, value)
        await self._session.commit()
        await self._session.refresh(gateway)
        return gateway

    async def delete(self, gateway: Gateway) -> None:
        await self._session.delete(gateway)
        await self._session.commit()
