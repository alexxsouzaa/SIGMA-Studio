from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.schemas.common import StandardResponse
from app.services.auth_service import AuthService, get_current_user

router = APIRouter()


@router.post("/login")
async def login(data: LoginRequest, session: AsyncSession = Depends(get_session)):
    service = AuthService(session)
    tokens = await service.authenticate(data.username, data.password)
    return StandardResponse(
        data=TokenResponse(**tokens),
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


@router.post("/logout")
async def logout():
    return StandardResponse(message="Logout successful")
