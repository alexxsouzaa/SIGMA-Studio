from fastapi import APIRouter

from app.api.devices import router as devices_router
from app.api.auth import router as auth_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(devices_router, prefix="/devices", tags=["devices"])


@router.get("/health")
async def health():
    return {"status": "ok"}
