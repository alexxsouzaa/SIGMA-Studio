from datetime import datetime, timezone
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.models.user import User
from app.models.role import Role
from app.utils.auth import (
    create_access_token,
    create_refresh_token,
)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"

PROVIDER_PREFIX = "google"


def is_google_configured() -> bool:
    return bool(settings.google_client_id and settings.google_client_secret)


def build_authorization_url(state: str) -> str:
    params = urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": settings.google_scope,
            "access_type": "online",
            "state": state,
            "prompt": "select_account",
        }
    )
    return f"{GOOGLE_AUTH_URL}?{params}"


async def exchange_code(code: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
    if resp.status_code != 200:
        try:
            detail = resp.json().get("error_description") or resp.json().get("error")
        except Exception:
            detail = resp.text[:200]
        raise HTTPException(
            status_code=400,
            detail=f"Falha ao trocar codigo do Google: {detail}",
        )
    return resp.json()


async def fetch_userinfo(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Falha ao obter dados do usuario Google")
    return resp.json()


def _generate_username(email: str) -> str:
    base = email.split("@")[0]
    candidate = f"{base}_{PROVIDER_PREFIX}"
    return candidate[:50]


class GoogleAuthService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_or_create_user(self, profile: dict) -> User:
        email = profile.get("email", "").lower()
        google_id = str(profile.get("sub", ""))
        name = profile.get("name") or email.split("@")[0]
        picture = profile.get("picture")

        user = None
        if google_id:
            result = await self._session.execute(
                select(User).where(User.google_id == google_id)
            )
            user = result.scalar_one_or_none()
        if not user and email:
            result = await self._session.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()

        if user:
            if google_id and not user.google_id:
                user.google_id = google_id
            if picture and not user.avatar_url:
                user.avatar_url = picture
            if name and not user.display_name:
                user.display_name = name
            user.last_login = datetime.now(timezone.utc)
            await self._session.commit()
            await self._session.refresh(user)
            return user

        username = _generate_username(email)
        existing = await self._session.execute(
            select(User).where(User.username == username)
        )
        if existing.scalar_one_or_none():
            username = f"{username}_{google_id[:6]}"

        visitor_role = await self._session.execute(
            select(Role).where(Role.name == "visitor")
        )
        role = visitor_role.scalars().first()

        user = User(
            username=username,
            email=email,
            password_hash="",  # OAuth user, sem senha local
            display_name=name,
            google_id=google_id,
            avatar_url=picture,
            role_id=role.id if role else None,
            active=True,
            last_login=datetime.now(timezone.utc),
        )
        user = await self._session.merge(user)
        await self._session.commit()
        await self._session.refresh(user)
        return user

    async def login_payload(self, user: User) -> dict:
        return {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
            "token_type": "bearer",
        }
