from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
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
        self._repository = UserRepository(session)

    async def authenticate(self, username: str, password: str) -> dict:
        user = await self._repository.get_by_username(username)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not user.active:
            raise HTTPException(status_code=403, detail="User is inactive")
        return {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
            "token_type": "bearer",
        }

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
