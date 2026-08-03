from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_model import AIModel


class AIModelRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_all(self, skip: int = 0, limit: int = 100) -> list[AIModel]:
        result = await self._session.execute(
            select(AIModel).order_by(AIModel.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id(self, model_id: int) -> AIModel | None:
        result = await self._session.execute(
            select(AIModel).where(AIModel.id == model_id)
        )
        return result.scalar_one_or_none()

    async def count(self) -> int:
        result = await self._session.execute(select(func.count(AIModel.id)))
        return result.scalar() or 0

    async def create(self, model: AIModel) -> AIModel:
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return model

    async def update(self, model: AIModel, data: dict) -> AIModel:
        for key, value in data.items():
            setattr(model, key, value)
        await self._session.commit()
        await self._session.refresh(model)
        return model

    async def delete(self, model: AIModel) -> None:
        await self._session.delete(model)
        await self._session.commit()
