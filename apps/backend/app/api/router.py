from fastapi import APIRouter

from app.api.devices import router as devices_router
from app.api.auth import router as auth_router
from app.api.organizations import router as organizations_router
from app.api.sites import router as sites_router
from app.api.projects import router as projects_router
from app.api.alerts import router as alerts_router
from app.api.gateways import router as gateways_router
from app.api.firmware import router as firmware_router
from app.api.ai_models import router as ai_models_router
from app.api.logs import router as logs_router
from app.api.dashboard import router as dashboard_router
from app.api.users import router as users_router
from app.api.websocket import router as websocket_router
from app.api.search import router as search_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(devices_router, prefix="/devices", tags=["devices"])
router.include_router(gateways_router, prefix="/gateways", tags=["gateways"])
router.include_router(firmware_router, prefix="/firmware", tags=["firmware"])
router.include_router(ai_models_router, prefix="/ai/models", tags=["ai"])
router.include_router(alerts_router, prefix="/alerts", tags=["alerts"])
router.include_router(logs_router, prefix="/logs", tags=["logs"])
router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
router.include_router(users_router, prefix="/users", tags=["users"])
router.include_router(search_router, prefix="/search", tags=["search"])
router.include_router(organizations_router, prefix="/organizations", tags=["organizations"])
router.include_router(
    sites_router,
    prefix="/organizations/{org_id}/sites",
    tags=["sites"],
)
router.include_router(
    projects_router,
    prefix="/organizations/{org_id}/sites/{site_id}/projects",
    tags=["projects"],
)


router.include_router(websocket_router, tags=["websocket"])


@router.get("/health")
async def health():
    return {"status": "ok"}
