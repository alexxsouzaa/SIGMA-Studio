from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.common import StandardResponse
from app.services.project_service import ProjectService

router = APIRouter()


def get_project_service(session: AsyncSession = Depends(get_session)) -> ProjectService:
    return ProjectService(session)


@router.get("/")
async def list_projects(
    site_id: int,
    skip: int = 0,
    limit: int = 100,
    service: ProjectService = Depends(get_project_service),
):
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
):
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
):
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
):
    project = await service.update_project(site_id, project_id, data)
    return StandardResponse(
        data=ProjectResponse.model_validate(project),
        message="Project updated",
    )
