from fastapi import APIRouter

from app.api.devices import router as devices_router
from app.api.auth import router as auth_router
from app.api.organizations import router as organizations_router
from app.api.sites import router as sites_router
from app.api.projects import router as projects_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(devices_router, prefix="/devices", tags=["devices"])
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


@router.get("/health")
async def health():
    return {"status": "ok"}
