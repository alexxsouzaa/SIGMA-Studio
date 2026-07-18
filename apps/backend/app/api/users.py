from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.models.user import User
from app.models.role import Role
from app.schemas.auth import UserResponse
from app.schemas.common import StandardResponse
from app.services.auth_service import get_current_user, build_user_response
from pydantic import BaseModel, Field

router = APIRouter()


class UpdateRoleRequest(BaseModel):
    role_id: int = Field(..., gt=0)


async def require_admin(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    if not user.role_id:
        raise HTTPException(status_code=403, detail="Admin access required")
    role = await session.get(Role, user.role_id)
    if not role or not role.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/")
async def list_users(
    session: AsyncSession = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    result = await session.execute(select(User).order_by(User.created_at.desc()))
    users = list(result.scalars().all())
    data = []
    for u in users:
        user_data = await build_user_response(u, session)
        data.append(UserResponse(**user_data))
    return StandardResponse(data=data, message="Users retrieved")


@router.put("/{user_id}/role")
async def update_user_role(
    user_id: int,
    data: UpdateRoleRequest,
    session: AsyncSession = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    role = await session.get(Role, data.role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    user.role_id = role.id
    await session.commit()
    await session.refresh(user)
    user_data = await build_user_response(user, session)
    return StandardResponse(data=UserResponse(**user_data), message="User role updated")


@router.get("/roles")
async def list_roles(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    result = await session.execute(select(Role).order_by(Role.id))
    roles = list(result.scalars().all())
    data = [{"id": r.id, "name": r.name, "description": r.description} for r in roles]
    return StandardResponse(data=data, message="Roles retrieved")
