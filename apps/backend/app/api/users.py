import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_admin
from app.database.session import get_session
from app.models.user import User
from app.models.role import Role
from app.schemas.auth import UserResponse
from app.schemas.common import StandardResponse
from app.services.auth_service import get_current_user, build_user_response
from app.utils.auth import hash_password
from pydantic import BaseModel, Field

router = APIRouter()


class UpdateRoleRequest(BaseModel):
    role_id: int = Field(..., gt=0)


class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    display_name: str = Field(default="", max_length=100)
    role_id: int | None = None


class UpdateUserRequest(BaseModel):
    display_name: str | None = Field(None, max_length=100)
    email: str | None = Field(None, min_length=5, max_length=255)
    active: bool | None = None


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
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Voce nao pode alterar seu proprio cargo")
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


@router.patch("/{user_id}")
async def update_user(
    user_id: int,
    data: UpdateUserRequest,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Voce nao pode alterar seu proprio perfil")
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.display_name is not None:
        user.display_name = data.display_name
    if data.email is not None:
        existing = await session.execute(select(User).where(User.email == data.email, User.id != user_id))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Email ja esta em uso")
        user.email = data.email
    if data.active is not None:
        user.active = data.active
    await session.commit()
    await session.refresh(user)
    user_data = await build_user_response(user, session)
    return StandardResponse(data=UserResponse(**user_data), message="User updated")


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Voce nao pode excluir sua propria conta")
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await session.delete(user)
    await session.commit()
    return StandardResponse(message="User deleted")


@router.post("/")
async def create_user(
    data: CreateUserRequest,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(require_admin),
):
    existing = await session.execute(select(User).where(User.username == data.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Username ja existe")
    existing_email = await session.execute(select(User).where(User.email == data.email))
    if existing_email.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email ja esta em uso")
    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name or data.username,
        role_id=data.role_id,
        active=True,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    user_data = await build_user_response(user, session)
    return StandardResponse(data=UserResponse(**user_data), message="User created")


@router.get("/roles")
async def list_roles(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    result = await session.execute(select(Role).order_by(Role.id))
    roles = list(result.scalars().all())
    data = [{"id": r.id, "name": r.name, "description": r.description} for r in roles]
    return StandardResponse(data=data, message="Roles retrieved")


@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Voce nao pode redefinir sua propria senha")
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    temporary_password = secrets.token_urlsafe(9)
    user.password_hash = hash_password(temporary_password)
    await session.commit()
    return StandardResponse(
        data={"temporary_password": temporary_password},
        message="Senha temporaria gerada. Envie ao usuario e solicite a troca no proximo login.",
    )
