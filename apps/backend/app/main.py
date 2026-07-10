from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.settings import settings
from app.api.router import router
from app.database.session import engine, async_session, Base
from app.websocket.manager import websocket_manager
from sqlalchemy import select

from app.utils.auth import hash_password

app = FastAPI(
    title="SIGMA Studio API",
    version=settings.app_name,
    description="Industrial Condition Monitoring Platform",
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred"},
            "timestamp": "",
            "request_id": "",
        },
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    from app.models.role import Role
    from app.models.user import User
    from app.models.organization import Organization
    from app.models.member import Member

    async with async_session() as session:
        existing = await session.get(Role, 1)
        if not existing:
            admin_role = Role(name="admin", description="Administrator", is_admin=True)
            operator_role = Role(name="operator", description="Operator", is_admin=False)
            viewer_role = Role(name="viewer", description="Viewer", is_admin=False)
            session.add_all([admin_role, operator_role, viewer_role])
            await session.commit()

        existing_admin = await session.execute(
            select(User).where(User.username == "admin")
        )
        admin_user = existing_admin.scalar_one_or_none()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@sigma.io",
                password_hash=hash_password("admin123"),
                display_name="Administrator",
                role_id=1,
                active=True,
            )
            session.add(admin_user)
            await session.commit()
            await session.refresh(admin_user)

        existing_org = await session.execute(
            select(Organization).where(Organization.slug == "default")
        )
        if not existing_org.scalar_one_or_none():
            org = Organization(name="Default Organization", slug="default")
            session.add(org)
            await session.commit()
            await session.refresh(org)

            member = Member(
                user_id=admin_user.id,
                organization_id=org.id,
                role_id=1,
            )
            session.add(member)
            await session.commit()


@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
    await websocket_manager.disconnect_all()
