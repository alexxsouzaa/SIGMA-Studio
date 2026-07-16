from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.models.user import User
from app.models.organization import Organization
from app.models.member import Member
from app.repositories.user_repository import UserRepository
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


class AuthService:
    def __init__(self, session: AsyncSession):
        self._session = session
        self._repository = UserRepository(session)

    async def authenticate(self, username: str, password: str) -> dict:
        user = await self._repository.get_by_username(username)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not user.active:
            raise HTTPException(status_code=403, detail="User is inactive")

        result = await self._session.execute(
            select(Organization).join(Member).where(
                Member.user_id == user.id,
                Member.active == True,
                Organization.active == True,
            )
        )
        organizations = list(result.scalars().all())

        return {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
            "token_type": "bearer",
            "user": user,
            "organizations": organizations,
        }

    async def register(self, username: str, email: str, password: str, display_name: str = "") -> dict:
        existing_user = await self._repository.get_by_username(username)
        if existing_user:
            raise HTTPException(status_code=409, detail="Username already registered")
        existing_email = await self._repository.get_by_email(email)
        if existing_email:
            raise HTTPException(status_code=409, detail="Email already registered")

        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            display_name=display_name or username,
            active=True,
        )
        user = await self._repository.create(user)

        return {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
            "token_type": "bearer",
            "user": user,
            "organizations": [],
        }

    async def update_profile(self, user_id: int, display_name: str | None, email: str | None):
        user = await self._repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if email and email != user.email:
            existing_email = await self._repository.get_by_email(email)
            if existing_email and existing_email.id != user_id:
                raise HTTPException(status_code=409, detail="Email already in use")
            user.email = email

        if display_name is not None:
            user.display_name = display_name

        await self._session.commit()
        await self._session.refresh(user)
        return user

    async def change_password(self, user_id: int, current_password: str, new_password: str):
        user = await self._repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not verify_password(current_password, user.password_hash):
            raise HTTPException(status_code=401, detail="Current password is incorrect")

        user.password_hash = hash_password(new_password)
        await self._session.commit()
        return user

    async def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user_id = int(payload["sub"])
        user = await self._repository.get_by_id(user_id)
        if not user or not user.active:
            raise HTTPException(status_code=401, detail="User not found or inactive")
        return {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
            "token_type": "bearer",
        }

    async def get_current_user(self, user_id: int):
        user = await self._repository.get_by_id(user_id)
        if not user or not user.active:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return user


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session),
):
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = int(payload["sub"])
    service = AuthService(session)
    return await service.get_current_user(user_id)
