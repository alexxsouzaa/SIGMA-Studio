from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.repositories.gateway_repository import GatewayRepository
from app.services.gateway_service import GatewayService
from app.api.deps import require_permission, org_scope, can_access_org
from app.schemas.gateway import GatewayCreate, GatewayUpdate, GatewayResponse
from app.schemas.common import StandardResponse
from app.models.user import User

router = APIRouter()


def get_gateway_service(session: AsyncSession = Depends(get_session)) -> GatewayService:
    repository = GatewayRepository(session)
    return GatewayService(repository)


@router.get("/")
async def list_gateways(
    skip: int = 0,
    limit: int = 100,
    service: GatewayService = Depends(get_gateway_service),
    _user: User = Depends(require_permission("gateways")),
    scope: set[int] | None = Depends(org_scope),
):
    gateways, total = await service.list_gateways(
        skip=skip, limit=limit, organization_ids=scope
    )
    return StandardResponse(
        data=[GatewayResponse.model_validate(g) for g in gateways],
        message="Gateways retrieved successfully",
    )


@router.get("/{gateway_id}")
async def get_gateway(
    gateway_id: int,
    service: GatewayService = Depends(get_gateway_service),
    _user: User = Depends(require_permission("gateways")),
    scope: set[int] | None = Depends(org_scope),
):
    gateway = await service.get_gateway(gateway_id)
    if not gateway:
        raise HTTPException(status_code=404, detail="Gateway not found")
    if not can_access_org(scope, gateway.organization_id):
        raise HTTPException(status_code=403, detail="Access denied")
    return StandardResponse(
        data=GatewayResponse.model_validate(gateway),
        message="Gateway retrieved successfully",
    )


@router.post("/", status_code=201)
async def create_gateway(
    data: GatewayCreate,
    service: GatewayService = Depends(get_gateway_service),
    _user: User = Depends(require_permission("gateways")),
    scope: set[int] | None = Depends(org_scope),
):
    if not can_access_org(scope, data.organization_id):
        raise HTTPException(status_code=403, detail="Access denied")
    gateway = await service.create_gateway(data)
    return StandardResponse(
        data=GatewayResponse.model_validate(gateway),
        message="Gateway created successfully",
    )


@router.put("/{gateway_id}")
async def update_gateway(
    gateway_id: int,
    data: GatewayUpdate,
    service: GatewayService = Depends(get_gateway_service),
    _user: User = Depends(require_permission("gateways")),
    scope: set[int] | None = Depends(org_scope),
):
    gateway = await service.get_gateway(gateway_id)
    if not gateway:
        raise HTTPException(status_code=404, detail="Gateway not found")
    if not can_access_org(scope, gateway.organization_id):
        raise HTTPException(status_code=403, detail="Access denied")
    updated = await service.update_gateway(gateway_id, data)
    return StandardResponse(
        data=GatewayResponse.model_validate(updated),
        message="Gateway updated successfully",
    )


@router.delete("/{gateway_id}")
async def delete_gateway(
    gateway_id: int,
    service: GatewayService = Depends(get_gateway_service),
    _user: User = Depends(require_permission("gateways")),
    scope: set[int] | None = Depends(org_scope),
):
    gateway = await service.get_gateway(gateway_id)
    if not gateway:
        raise HTTPException(status_code=404, detail="Gateway not found")
    if not can_access_org(scope, gateway.organization_id):
        raise HTTPException(status_code=403, detail="Access denied")
    deleted = await service.delete_gateway(gateway_id)
    return StandardResponse(message="Gateway deleted successfully")
