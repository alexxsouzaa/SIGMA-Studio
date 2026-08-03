from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from urllib.parse import urlencode

from app.database.session import get_session
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    PreferencesRequest,
    RefreshRequest,
    TokenResponse,
    UserResponse,
    LoginResponse,
)
from app.schemas.organization import OrganizationResponse
from app.schemas.common import StandardResponse
from app.services.auth_service import AuthService, get_current_user, build_user_response
from app.services.google_auth_service import (
    GoogleAuthService,
    build_authorization_url,
    exchange_code,
    fetch_userinfo,
    is_google_configured,
)
from app.config.settings import settings
from app.models.user import User

router = APIRouter()


@router.post("/register")
async def register(data: RegisterRequest, session: AsyncSession = Depends(get_session)):
    service = AuthService(session)
    result = await service.register(data.username, data.email, data.password, data.display_name)
    user_data = await build_user_response(result["user"], session)
    return StandardResponse(
        data=LoginResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            token_type=result["token_type"],
            user=UserResponse(**user_data),
            organizations=[],
        ),
        message="Registration successful",
    )


@router.post("/login")
async def login(data: LoginRequest, session: AsyncSession = Depends(get_session)):
    service = AuthService(session)
    result = await service.authenticate(data.username, data.password)
    user_data = await build_user_response(result["user"], session)
    return StandardResponse(
        data=LoginResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            token_type=result["token_type"],
            user=UserResponse(**user_data),
            organizations=[
                OrganizationResponse.model_validate(o) for o in result["organizations"]
            ],
        ),
        message="Login successful",
    )


@router.post("/refresh")
async def refresh(data: RefreshRequest, session: AsyncSession = Depends(get_session)):
    service = AuthService(session)
    tokens = await service.refresh_token(data.refresh_token)
    return StandardResponse(
        data=TokenResponse(**tokens),
        message="Token refreshed",
    )


@router.get("/me")
async def get_me(user=Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    user_data = await build_user_response(user, session)
    return StandardResponse(
        data=UserResponse(**user_data),
        message="User retrieved",
    )


@router.patch("/me")
async def update_me(
    data: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    service = AuthService(session)
    updated = await service.update_profile(user.id, data.display_name, data.email)
    user_data = await build_user_response(updated, session)
    return StandardResponse(
        data=UserResponse(**user_data),
        message="Profile updated",
    )


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    service = AuthService(session)
    await service.change_password(user.id, data.current_password, data.new_password)
    return StandardResponse(message="Password changed successfully")


@router.get("/me/preferences")
async def get_preferences(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    service = AuthService(session)
    prefs = await service.get_preferences(user.id)
    return StandardResponse(data=prefs, message="Preferences retrieved")


@router.patch("/me/preferences")
async def update_preferences(
    data: PreferencesRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    service = AuthService(session)
    prefs = await service.update_preferences(user.id, data.preferences)
    return StandardResponse(data=prefs, message="Preferences updated")


@router.post("/logout")
async def logout():
    return StandardResponse(message="Logout successful")


@router.get("/google/login")
async def google_login():
    if not is_google_configured():
        raise HTTPException(
            status_code=503,
            detail="Login com Google nao configurado no servidor",
        )
    state = "sigma-studio"
    return RedirectResponse(url=build_authorization_url(state))


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str | None = None,
    session: AsyncSession = Depends(get_session),
):
    if not is_google_configured():
        raise HTTPException(status_code=503, detail="Google OAuth nao configurado")

    tokens = await exchange_code(code)
    profile = await fetch_userinfo(tokens["access_token"])

    service = GoogleAuthService(session)
    user = await service.get_or_create_user(profile)
    payload = await service.login_payload(user)

    user_data = await build_user_response(user, session)
    params = urlencode(
        {
            "access_token": payload["access_token"],
            "refresh_token": payload["refresh_token"],
            "token_type": payload["token_type"],
            "user": user_data["display_name"] or "",
            "avatar": user_data.get("avatar_url") or "",
        }
    )
    frontend_origin = settings.frontend_url.rstrip("/") or (
        settings.cors_origins[0].rstrip("/") if settings.cors_origins else ""
    )
    base_path = getattr(settings, "frontend_base_path", "") or ""
    return RedirectResponse(url=f"{frontend_origin}{base_path}/google/callback?{params}")
