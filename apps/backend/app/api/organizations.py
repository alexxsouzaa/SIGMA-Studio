from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
)
from app.schemas.common import StandardResponse
from app.services.organization_service import OrganizationService

router = APIRouter()


def get_org_service(session: AsyncSession = Depends(get_session)) -> OrganizationService:
    return OrganizationService(session)


@router.get("/")
async def list_organizations(
    skip: int = 0,
    limit: int = 100,
    service: OrganizationService = Depends(get_org_service),
):
    orgs, total = await service.list_organizations(skip=skip, limit=limit)
    return StandardResponse(
        data=[OrganizationResponse.model_validate(o) for o in orgs],
        message="Organizations retrieved",
    )


@router.get("/{org_id}")
async def get_organization(
    org_id: int,
    service: OrganizationService = Depends(get_org_service),
):
    org = await service.get_organization(org_id)
    return StandardResponse(
        data=OrganizationResponse.model_validate(org),
        message="Organization retrieved",
    )


@router.post("/", status_code=201)
async def create_organization(
    data: OrganizationCreate,
    service: OrganizationService = Depends(get_org_service),
):
    org = await service.create_organization(data)
    return StandardResponse(
        data=OrganizationResponse.model_validate(org),
        message="Organization created",
    )


@router.put("/{org_id}")
async def update_organization(
    org_id: int,
    data: OrganizationUpdate,
    service: OrganizationService = Depends(get_org_service),
):
    org = await service.update_organization(org_id, data)
    return StandardResponse(
        data=OrganizationResponse.model_validate(org),
        message="Organization updated",
    )
