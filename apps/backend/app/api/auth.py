import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

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
from app.services.auth_service import ACCESS_COOKIE, REFRESH_COOKIE
from app.services.google_auth_service import (
    GoogleAuthService,
    build_authorization_url,
    exchange_code,
    fetch_userinfo,
    is_google_configured,
)
from app.api.rate_limit import limiter
from app.config.settings import settings
from app.models.user import User

router = APIRouter()

_OAUTH_STATE_COOKIE = "oauth_state"
_OAUTH_STATE_MAX_AGE = 600


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key=ACCESS_COOKIE,
        value=access_token,
        max_age=settings.jwt_expire_minutes * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=refresh_token,
        max_age=settings.jwt_refresh_expire_days * 86400,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/api/v1/auth",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(ACCESS_COOKIE, path="/")
    response.delete_cookie(REFRESH_COOKIE, path="/api/v1/auth")


@router.post("/register", status_code=201)
@limiter.limit("5/minute")
async def register(
    request: Request,
    data: RegisterRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    service = AuthService(session)
    result = await service.register(data.username, data.email, data.password, data.display_name)
    user_data = await build_user_response(result["user"], session)
    _set_auth_cookies(response, result["access_token"], result["refresh_token"])
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
@limiter.limit("10/minute")
async def login(
    request: Request,
    data: LoginRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    service = AuthService(session)
    result = await service.authenticate(data.username, data.password)
    user_data = await build_user_response(result["user"], session)
    _set_auth_cookies(response, result["access_token"], result["refresh_token"])
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
@limiter.limit("30/minute")
async def refresh(
    request: Request,
    data: RefreshRequest,
    response: Response,
    session: AsyncSession = Depends(get_session),
):
    service = AuthService(session)
    tokens = await service.refresh_token(data.refresh_token)
    _set_auth_cookies(response, tokens["access_token"], tokens["refresh_token"])
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
async def logout(response: Response):
    _clear_auth_cookies(response)
    return StandardResponse(message="Logout successful")


@router.get("/google/login")
async def google_login(response: Response):
    if not is_google_configured():
        raise HTTPException(
            status_code=503,
            detail="Login com Google nao configurado no servidor",
        )
    state = secrets.token_urlsafe(32)
    response.set_cookie(
        key=_OAUTH_STATE_COOKIE,
        value=state,
        max_age=_OAUTH_STATE_MAX_AGE,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/api/v1/auth",
    )
    return RedirectResponse(url=build_authorization_url(state))


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str | None = None,
    request: Request = None,
    session: AsyncSession = Depends(get_session),
):
    if not is_google_configured():
        raise HTTPException(status_code=503, detail="Google OAuth nao configurado")

    expected_state = request.cookies.get(_OAUTH_STATE_COOKIE)
    if not state or not expected_state or not secrets.compare_digest(state, expected_state):
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    tokens = await exchange_code(code)
    profile = await fetch_userinfo(tokens["access_token"])

    service = GoogleAuthService(session)
    user = await service.get_or_create_user(profile)
    payload = await service.login_payload(user)

    frontend_origin = settings.frontend_url.rstrip("/") or (
        settings.cors_origins[0].rstrip("/") if settings.cors_origins else ""
    )
    base_path = (getattr(settings, "frontend_base_path", "") or "").rstrip("/")
    callback_path = "google/callback"
    response = RedirectResponse(url=f"{frontend_origin}{base_path}/{callback_path}")
    _set_auth_cookies(response, payload["access_token"], payload["refresh_token"])
    return response
