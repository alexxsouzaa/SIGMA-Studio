from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.common import StandardResponse
from app.services.dashboard_service import DashboardService
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/summary")
async def get_summary(
    request: Request,
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    service = DashboardService(session)
    messages_per_minute = request.app.state.mqtt_manager.get_message_rate()
    data = await service.get_summary(messages_per_minute=messages_per_minute)
    return StandardResponse(data=data, message="Dashboard summary retrieved")


@router.get("/protocols")
async def get_protocols(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    service = DashboardService(session)
    data = await service.get_protocols()
    return StandardResponse(data=data, message="Protocol distribution retrieved")


@router.get("/gateways")
async def get_gateway_summary(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    service = DashboardService(session)
    data = await service.get_gateway_summary()
    return StandardResponse(data=data, message="Gateway summary retrieved")


@router.get("/ai-insights")
async def get_ai_insights(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    service = DashboardService(session)
    data = await service.get_ai_insights()
    return StandardResponse(data=data, message="AI insights retrieved")
