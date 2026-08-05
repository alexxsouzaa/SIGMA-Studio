import json

from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.models.member import Member
from app.models.role import Role
from app.models.user import User
from app.services.auth_service import get_current_user


def _role_permissions(role: Role | None) -> list[str]:
    if not role or not role.permissions:
        return []
    try:
        perms = json.loads(role.permissions)
        return perms if isinstance(perms, list) else []
    except (json.JSONDecodeError, TypeError):
        return []


async def _is_admin(user: User, session: AsyncSession) -> bool:
    if not user.role_id:
        return False
    role = await session.get(Role, user.role_id)
    if not role:
        return False
    if role.is_admin or "*" in _role_permissions(role):
        return True
    return False


def require_permission(permission: str):
    async def dependency(
        user: User = Depends(get_current_user),
        session: AsyncSession = Depends(get_session),
    ):
        if await _is_admin(user, session):
            return user
        if not user.role_id:
            raise HTTPException(status_code=403, detail="Access denied")
        role = await session.get(Role, user.role_id)
        if permission in _role_permissions(role):
            return user
        raise HTTPException(status_code=403, detail="Access denied")

    return dependency


async def require_admin(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if not await _is_admin(user, session):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def get_user_scope(user: User, session: AsyncSession) -> set[int] | None:
    """Set of organization ids the user belongs to, or None for unrestricted (admin)."""
    if await _is_admin(user, session):
        return None
    result = await session.execute(
        select(Member.organization_id).where(
            Member.user_id == user.id,
            Member.active == True,
        )
    )
    return set(result.scalars().all())


async def org_scope(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> set[int] | None:
    return await get_user_scope(user, session)


def can_access_org(scope: set[int] | None, organization_id: int) -> bool:
    if scope is None:
        return True
    return organization_id in scope
