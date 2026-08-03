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
        try:
            await conn.run_sync(
                lambda sync_conn: sync_conn.exec_driver_sql(
                    "ALTER TABLE users ADD COLUMN preferences TEXT"
                )
            )
        except Exception:
            pass
        try:
            await conn.run_sync(
                lambda sync_conn: sync_conn.exec_driver_sql(
                    "ALTER TABLE users ADD COLUMN last_login DATETIME"
                )
            )
        except Exception:
            pass
        try:
            await conn.run_sync(
                lambda sync_conn: sync_conn.exec_driver_sql(
                    "ALTER TABLE users ADD COLUMN google_id VARCHAR(50)"
                )
            )
        except Exception:
            pass
        try:
            await conn.run_sync(
                lambda sync_conn: sync_conn.exec_driver_sql(
                    "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)"
                )
            )
        except Exception:
            pass

    from app.models.role import Role
    from app.models.user import User
    from app.models.organization import Organization
    from app.models.member import Member

    async with async_session() as session:
        existing = await session.get(Role, 1)
        if not existing:
            import json
            admin_perms = json.dumps(["*"])
            engineer_perms = json.dumps([
                "dashboard", "devices", "alarms", "telemetry",
                "gateways", "firmware", "ia", "logs", "search",
                "profile", "settings", "users"
            ])
            technician_perms = json.dumps([
                "dashboard", "devices", "alarms", "telemetry",
                "gateways", "logs", "search", "profile"
            ])
            operator_perms = json.dumps([
                "dashboard", "alarms", "search", "profile"
            ])
            visitor_perms = json.dumps([
                "dashboard", "search"
            ])
            admin_role = Role(name="admin", description="Administrador", is_admin=True, permissions=admin_perms)
            engineer_role = Role(name="engineer", description="Engenheiro", is_admin=False, permissions=engineer_perms)
            technician_role = Role(name="technician", description="Tecnico", is_admin=False, permissions=technician_perms)
            operator_role = Role(name="operator", description="Operador", is_admin=False, permissions=operator_perms)
            visitor_role = Role(name="visitor", description="Visitante", is_admin=False, permissions=visitor_perms)
            session.add_all([admin_role, engineer_role, technician_role, operator_role, visitor_role])
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
