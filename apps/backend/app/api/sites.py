from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.site import SiteCreate, SiteUpdate, SiteResponse
from app.schemas.common import StandardResponse
from app.services.site_service import SiteService
from app.services.auth_service import get_current_user
from app.api.deps import require_permission, org_scope, can_access_org
from app.models.user import User

router = APIRouter()


def get_site_service(session: AsyncSession = Depends(get_session)) -> SiteService:
    return SiteService(session)


@router.get("/")
async def list_sites(
    org_id: int,
    skip: int = 0,
    limit: int = 100,
    service: SiteService = Depends(get_site_service),
    _user: User = Depends(get_current_user),
    scope: set[int] | None = Depends(org_scope),
):
    if not can_access_org(scope, org_id):
        raise HTTPException(status_code=403, detail="Access denied")
    sites, total = await service.list_sites(org_id, skip=skip, limit=limit)
    return StandardResponse(
        data=[SiteResponse.model_validate(s) for s in sites],
        message="Sites retrieved",
    )


@router.get("/{site_id}")
async def get_site(
    org_id: int,
    site_id: int,
    service: SiteService = Depends(get_site_service),
    _user: User = Depends(get_current_user),
    scope: set[int] | None = Depends(org_scope),
):
    if not can_access_org(scope, org_id):
        raise HTTPException(status_code=403, detail="Access denied")
    site = await service.get_site(org_id, site_id)
    return StandardResponse(
        data=SiteResponse.model_validate(site),
        message="Site retrieved",
    )


@router.post("/", status_code=201)
async def create_site(
    org_id: int,
    data: SiteCreate,
    service: SiteService = Depends(get_site_service),
    _user: User = Depends(require_permission("devices")),
    scope: set[int] | None = Depends(org_scope),
):
    if not can_access_org(scope, org_id):
        raise HTTPException(status_code=403, detail="Access denied")
    site = await service.create_site(org_id, data)
    return StandardResponse(
        data=SiteResponse.model_validate(site),
        message="Site created",
    )


@router.put("/{site_id}")
async def update_site(
    org_id: int,
    site_id: int,
    data: SiteUpdate,
    service: SiteService = Depends(get_site_service),
    _user: User = Depends(require_permission("devices")),
    scope: set[int] | None = Depends(org_scope),
):
    if not can_access_org(scope, org_id):
        raise HTTPException(status_code=403, detail="Access denied")
    site = await service.update_site(org_id, site_id, data)
    return StandardResponse(
        data=SiteResponse.model_validate(site),
        message="Site updated",
    )
