from fastapi import HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import Organization
from app.models.member import Member
from app.schemas.organization import OrganizationCreate, OrganizationUpdate


class OrganizationService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def list_organizations(self, skip: int = 0, limit: int = 100):
        query = select(Organization).offset(skip).limit(limit).order_by(Organization.name)
        result = await self._session.execute(query)
        orgs = result.scalars().all()
        count_query = select(func.count()).select_from(Organization)
        count_result = await self._session.execute(count_query)
        total = count_result.scalar()
        return list(orgs), total

    async def get_organization(self, org_id: int):
        org = await self._session.get(Organization, org_id)
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        return org

    async def create_organization(self, data: OrganizationCreate):
        existing = await self._session.execute(
            select(Organization).where(Organization.slug == data.slug)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Slug already exists")
        org = Organization(name=data.name, slug=data.slug)
        self._session.add(org)
        await self._session.commit()
        await self._session.refresh(org)
        return org

    async def update_organization(self, org_id: int, data: OrganizationUpdate):
        org = await self.get_organization(org_id)
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(org, key, value)
        await self._session.commit()
        await self._session.refresh(org)
        return org

    async def add_member(self, org_id: int, user_id: int, role_id: int):
        existing = await self._session.execute(
            select(Member).where(
                Member.organization_id == org_id,
                Member.user_id == user_id,
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="User is already a member")
        member = Member(
            user_id=user_id,
            organization_id=org_id,
            role_id=role_id,
        )
        self._session.add(member)
        await self._session.commit()
        return member
