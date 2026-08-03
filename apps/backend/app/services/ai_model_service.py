from app.models.ai_model import AIModel
from app.repositories.ai_model_repository import AIModelRepository
from app.schemas.ai_model import AIModelCreate, AIModelUpdate


class AIModelService:
    def __init__(self, repository: AIModelRepository):
        self._repository = repository

    async def list_models(
        self, skip: int = 0, limit: int = 100
    ) -> tuple[list[AIModel], int]:
        models = await self._repository.list_all(skip=skip, limit=limit)
        total = await self._repository.count()
        return models, total

    async def get_model(self, model_id: int) -> AIModel | None:
        return await self._repository.get_by_id(model_id)

    async def create_model(self, data: AIModelCreate) -> AIModel:
        model = AIModel(
            name=data.name,
            type=data.type,
            framework=data.framework,
            accuracy=data.accuracy,
            latency=data.latency,
            f1=data.f1,
            device=data.device,
            size=data.size,
            description=data.description,
        )
        return await self._repository.create(model)

    async def update_model(
        self, model_id: int, data: AIModelUpdate
    ) -> AIModel | None:
        model = await self._repository.get_by_id(model_id)
        if not model:
            return None
        update_data = data.model_dump(exclude_unset=True)
        return await self._repository.update(model, update_data)

    async def delete_model(self, model_id: int) -> bool:
        model = await self._repository.get_by_id(model_id)
        if not model:
            return False
        await self._repository.delete(model)
        return True
