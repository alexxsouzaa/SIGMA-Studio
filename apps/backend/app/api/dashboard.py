from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.common import StandardResponse
from app.services.dashboard_service import DashboardService
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/summary")
async def get_summary(
    session: AsyncSession = Depends(get_session),
    _user: User = Depends(get_current_user),
):
    service = DashboardService(session)
    data = await service.get_summary()
    return StandardResponse(data=data, message="Dashboard summary retrieved")
