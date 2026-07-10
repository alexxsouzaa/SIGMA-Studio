from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.site import Site
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_projects(self, site_id: int, skip: int = 0, limit: int = 100):
        query = (
            select(Project)
            .where(Project.site_id == site_id)
            .offset(skip)
            .limit(limit)
            .order_by(Project.name)
        )
        result = await self._session.execute(query)
        projects = result.scalars().all()
        count_query = (
            select(func.count())
            .select_from(Project)
            .where(Project.site_id == site_id)
        )
        count_result = await self._session.execute(count_query)
        total = count_result.scalar()
        return list(projects), total

    async def get_project(self, site_id: int, project_id: int):
        project = await self._session.get(Project, project_id)
        if not project or project.site_id != site_id:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

    async def create_project(self, site_id: int, data: ProjectCreate):
        site = await self._session.get(Site, site_id)
        if not site:
            raise HTTPException(status_code=404, detail="Site not found")
        project = Project(
            site_id=site_id,
            name=data.name,
            description=data.description,
        )
        self._session.add(project)
        await self._session.commit()
        await self._session.refresh(project)
        return project

    async def update_project(self, site_id: int, project_id: int, data: ProjectUpdate):
        project = await self.get_project(site_id, project_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(project, key, value)
        await self._session.commit()
        await self._session.refresh(project)
        return project
