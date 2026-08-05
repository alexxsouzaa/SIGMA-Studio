from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.common import StandardResponse
from app.services.project_service import ProjectService
from app.services.site_service import SiteService
from app.services.auth_service import get_current_user
from app.api.deps import require_permission, org_scope, can_access_org
from app.models.user import User

router = APIRouter()


def get_project_service(session: AsyncSession = Depends(get_session)) -> ProjectService:
    return ProjectService(session)


def get_site_service(session: AsyncSession = Depends(get_session)) -> SiteService:
    return SiteService(session)


async def _ensure_scope(scope: set[int] | None, site_service: SiteService, site_id: int) -> None:
    if scope is not None:
        org_id = await site_service.get_site_organization_id(site_id)
        if org_id is None:
            raise HTTPException(status_code=404, detail="Site not found")
        if not can_access_org(scope, org_id):
            raise HTTPException(status_code=403, detail="Access denied")


@router.get("/")
async def list_projects(
    site_id: int,
    skip: int = 0,
    limit: int = 100,
    service: ProjectService = Depends(get_project_service),
    site_service: SiteService = Depends(get_site_service),
    _user: User = Depends(get_current_user),
    scope: set[int] | None = Depends(org_scope),
):
    await _ensure_scope(scope, site_service, site_id)
    projects, total = await service.list_projects(site_id, skip=skip, limit=limit)
    return StandardResponse(
        data=[ProjectResponse.model_validate(p) for p in projects],
        message="Projects retrieved",
    )


@router.get("/{project_id}")
async def get_project(
    site_id: int,
    project_id: int,
    service: ProjectService = Depends(get_project_service),
    site_service: SiteService = Depends(get_site_service),
    _user: User = Depends(get_current_user),
    scope: set[int] | None = Depends(org_scope),
):
    await _ensure_scope(scope, site_service, site_id)
    project = await service.get_project(site_id, project_id)
    return StandardResponse(
        data=ProjectResponse.model_validate(project),
        message="Project retrieved",
    )


@router.post("/", status_code=201)
async def create_project(
    site_id: int,
    data: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
    site_service: SiteService = Depends(get_site_service),
    _user: User = Depends(require_permission("devices")),
    scope: set[int] | None = Depends(org_scope),
):
    await _ensure_scope(scope, site_service, site_id)
    project = await service.create_project(site_id, data)
    return StandardResponse(
        data=ProjectResponse.model_validate(project),
        message="Project created",
    )


@router.put("/{project_id}")
async def update_project(
    site_id: int,
    project_id: int,
    data: ProjectUpdate,
    service: ProjectService = Depends(get_project_service),
    site_service: SiteService = Depends(get_site_service),
    _user: User = Depends(require_permission("devices")),
    scope: set[int] | None = Depends(org_scope),
):
    await _ensure_scope(scope, site_service, site_id)
    project = await service.update_project(site_id, project_id, data)
    return StandardResponse(
        data=ProjectResponse.model_validate(project),
        message="Project updated",
    )
