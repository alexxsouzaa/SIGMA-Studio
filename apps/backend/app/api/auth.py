from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    PreferencesRequest,
    TokenResponse,
    UserResponse,
    LoginResponse,
)
from app.schemas.organization import OrganizationResponse
from app.schemas.common import StandardResponse
from app.services.auth_service import AuthService, get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register")
async def register(data: RegisterRequest, session: AsyncSession = Depends(get_session)):
    service = AuthService(session)
    result = await service.register(data.username, data.email, data.password, data.display_name)
    return StandardResponse(
        data=LoginResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            token_type=result["token_type"],
            user=UserResponse.model_validate(result["user"]),
            organizations=[],
        ),
        message="Registration successful",
    )


@router.post("/login")
async def login(data: LoginRequest, session: AsyncSession = Depends(get_session)):
    service = AuthService(session)
    result = await service.authenticate(data.username, data.password)
    return StandardResponse(
        data=LoginResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            token_type=result["token_type"],
            user=UserResponse.model_validate(result["user"]),
            organizations=[
                OrganizationResponse.model_validate(o) for o in result["organizations"]
            ],
        ),
        message="Login successful",
    )


@router.post("/refresh")
async def refresh(refresh_token: str, session: AsyncSession = Depends(get_session)):
    service = AuthService(session)
    tokens = await service.refresh_token(refresh_token)
    return StandardResponse(
        data=TokenResponse(**tokens),
        message="Token refreshed",
    )


@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    return StandardResponse(
        data=UserResponse.model_validate(user),
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
    return StandardResponse(
        data=UserResponse.model_validate(updated),
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
