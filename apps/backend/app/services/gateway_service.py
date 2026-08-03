from app.models.gateway import Gateway
from app.repositories.gateway_repository import GatewayRepository
from app.schemas.gateway import GatewayCreate, GatewayUpdate


class GatewayService:
    def __init__(self, repository: GatewayRepository):
        self._repository = repository

    async def list_gateways(
        self, skip: int = 0, limit: int = 100
    ) -> tuple[list[Gateway], int]:
        gateways = await self._repository.list_all(skip=skip, limit=limit)
        total = await self._repository.count()
        return gateways, total

    async def get_gateway(self, gateway_id: int) -> Gateway | None:
        return await self._repository.get_by_id(gateway_id)

    async def create_gateway(self, data: GatewayCreate) -> Gateway:
        gateway = Gateway(
            name=data.name,
            protocol=data.protocol,
            endpoint=data.endpoint,
            status=data.status,
            organization_id=data.organization_id,
        )
        return await self._repository.create(gateway)

    async def update_gateway(
        self, gateway_id: int, data: GatewayUpdate
    ) -> Gateway | None:
        gateway = await self._repository.get_by_id(gateway_id)
        if not gateway:
            return None
        update_data = data.model_dump(exclude_unset=True)
        return await self._repository.update(gateway, update_data)

    async def delete_gateway(self, gateway_id: int) -> bool:
        gateway = await self._repository.get_by_id(gateway_id)
        if not gateway:
            return False
        await self._repository.delete(gateway)
        return True
