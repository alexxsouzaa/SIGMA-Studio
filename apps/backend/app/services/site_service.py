from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.site import Site
from app.schemas.site import SiteCreate, SiteUpdate


class SiteService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_sites(self, org_id: int, skip: int = 0, limit: int = 100):
        query = (
            select(Site)
            .where(Site.organization_id == org_id)
            .offset(skip)
            .limit(limit)
            .order_by(Site.name)
        )
        result = await self._session.execute(query)
        sites = result.scalars().all()
        count_query = (
            select(func.count())
            .select_from(Site)
            .where(Site.organization_id == org_id)
        )
        count_result = await self._session.execute(count_query)
        total = count_result.scalar()
        return list(sites), total

    async def get_site(self, org_id: int, site_id: int):
        site = await self._session.get(Site, site_id)
        if not site or site.organization_id != org_id:
            raise HTTPException(status_code=404, detail="Site not found")
        return site

    async def get_site_organization_id(self, site_id: int) -> int | None:
        site = await self._session.get(Site, site_id)
        return site.organization_id if site else None

    async def create_site(self, org_id: int, data: SiteCreate):
        site = Site(
            organization_id=org_id,
            name=data.name,
            location=data.location,
        )
        self._session.add(site)
        await self._session.commit()
        await self._session.refresh(site)
        return site

    async def update_site(self, org_id: int, site_id: int, data: SiteUpdate):
        site = await self.get_site(org_id, site_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(site, key, value)
        await self._session.commit()
        await self._session.refresh(site)
        return site
