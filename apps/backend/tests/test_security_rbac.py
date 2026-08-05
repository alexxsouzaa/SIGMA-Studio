import json
from types import SimpleNamespace

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.pool import StaticPool

# --- Patch the DB layer BEFORE any app.api module is imported ---
import app.database.session as db_session

_engine = create_async_engine(
    "sqlite+aiosqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestSession = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)


async def _get_test_session():
    async with _TestSession() as s:
        yield s


db_session.get_session = _get_test_session
db_session.async_session = _TestSession

# --- Now it is safe to import the app modules ---
from app.main import app  # noqa: E402
from app.database.session import Base  # noqa: E402
from app.models.role import Role  # noqa: E402
from app.models.organization import Organization  # noqa: E402
from app.models.member import Member  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.device import Device  # noqa: E402
from app.utils.auth import hash_password, create_access_token  # noqa: E402

app.state.mqtt_manager = SimpleNamespace(get_message_rate=lambda: 0)

_ADMIN_PERMS = json.dumps(["*"])
_ENGINEER_PERMS = json.dumps(["dashboard", "devices", "alarms", "search"])
_OPERATOR_PERMS = json.dumps(["dashboard", "alarms", "search"])


@pytest_asyncio.fixture(autouse=True)
async def seed_db():
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with _TestSession() as s:
        admin_role = Role(name="admin", is_admin=True, permissions=_ADMIN_PERMS)
        engineer_role = Role(name="engineer", is_admin=False, permissions=_ENGINEER_PERMS)
        operator_role = Role(name="operator", is_admin=False, permissions=_OPERATOR_PERMS)
        s.add_all([admin_role, engineer_role, operator_role])
        await s.flush()

        org_a = Organization(name="Org A", slug="org-a")
        org_b = Organization(name="Org B", slug="org-b")
        s.add_all([org_a, org_b])
        await s.flush()

        admin = User(
            username="admin", email="admin@x.io",
            password_hash=hash_password("admin-pass-123"), role_id=admin_role.id,
            active=True, display_name="Admin",
        )
        engineer = User(
            username="engineer", email="eng@x.io",
            password_hash=hash_password("eng-pass-123"), role_id=engineer_role.id,
            active=True, display_name="Engineer",
        )
        operator = User(
            username="operator", email="op@x.io",
            password_hash=hash_password("op-pass-123"), role_id=operator_role.id,
            active=True, display_name="Operator",
        )
        s.add_all([admin, engineer, operator])
        await s.flush()

        s.add(Member(user_id=engineer.id, organization_id=org_a.id, role_id=engineer_role.id))
        s.add(Member(user_id=operator.id, organization_id=org_b.id, role_id=operator_role.id))

        s.add(Device(
            organization_id=org_a.id, name="DEV-A1", serial_number="SN-A1",
            firmware_version="1.0.0", active=True,
        ))
        s.add(Device(
            organization_id=org_b.id, name="DEV-B1", serial_number="SN-B1",
            firmware_version="1.0.0", active=True,
        ))
        await s.commit()

        yield {
            "org_a": org_a.id,
            "org_b": org_b.id,
            "admin_token": create_access_token(str(admin.id)),
            "engineer_token": create_access_token(str(engineer.id)),
            "operator_token": create_access_token(str(operator.id)),
        }


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def test_devices_requires_authentication(client):
    response = await client.get("/api/v1/devices/")
    assert response.status_code == 401


async def test_devices_requires_permission(client, seed_db):
    token = seed_db["operator_token"]
    response = await client.get("/api/v1/devices/", headers=_auth(token))
    assert response.status_code == 403


async def test_engineer_only_sees_own_org_devices(client, seed_db):
    token = seed_db["engineer_token"]
    response = await client.get("/api/v1/devices/", headers=_auth(token))
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["name"] == "DEV-A1"


async def test_engineer_cannot_read_foreign_device(client, seed_db):
    token = seed_db["engineer_token"]
    foreign = await _foreign_device_id(seed_db["org_b"])
    response = await client.get(f"/api/v1/devices/{foreign}", headers=_auth(token))
    assert response.status_code == 403


async def test_engineer_cannot_create_device_in_foreign_org(client, seed_db):
    token = seed_db["engineer_token"]
    response = await client.post(
        "/api/v1/devices/",
        headers=_auth(token),
        json={"name": "X", "organization_id": seed_db["org_b"], "serial_number": "SN-X"},
    )
    assert response.status_code == 403


async def test_engineer_cannot_access_foreign_org_sites(client, seed_db):
    token = seed_db["engineer_token"]
    response = await client.get(
        f"/api/v1/organizations/{seed_db['org_b']}/sites/", headers=_auth(token)
    )
    assert response.status_code == 403


async def test_admin_sees_all_devices(client, seed_db):
    token = seed_db["admin_token"]
    response = await client.get("/api/v1/devices/", headers=_auth(token))
    assert response.status_code == 200
    assert len(response.json()["data"]) == 2


async def test_alerts_scoped_to_org(client, seed_db):
    token = seed_db["engineer_token"]
    response = await client.get("/api/v1/alerts/", headers=_auth(token))
    assert response.status_code == 200


async def test_google_callback_rejects_invalid_state(client):
    response = await client.get(
        "/api/v1/auth/google/callback?code=abc&state=invalid-state"
    )
    assert response.status_code == 400


async def test_google_login_sets_state_cookie(client):
    response = await client.get("/api/v1/auth/google/login", follow_redirects=False)
    assert response.status_code == 307
    set_cookie = response.headers.get("set-cookie", "")
    assert "oauth_state=" in set_cookie
    assert "HttpOnly" in set_cookie


async def test_login_by_email(client, seed_db):
    response = await client.post(
        "/api/v1/auth/login", json={"username": "eng@x.io", "password": "eng-pass-123"}
    )
    assert response.status_code == 200
    assert response.json()["data"]["access_token"]


async def test_login_rejects_wrong_password(client, seed_db):
    response = await client.post(
        "/api/v1/auth/login", json={"username": "engineer", "password": "wrong-pass"}
    )
    assert response.status_code == 401


async def test_login_rate_limited(client, seed_db):
    login = {"username": "operator", "password": "op-pass-123"}
    statuses = []
    for _ in range(12):
        response = await client.post("/api/v1/auth/login", json=login)
        statuses.append(response.status_code)
    assert statuses[-1] == 429


async def test_telemetry_ingest_requires_auth(client):
    response = await client.post(
        "/api/v1/telemetry", json={"serial_number": "SN-A1", "temperature": 30}
    )
    assert response.status_code == 401


async def test_telemetry_ingest_requires_permission(client, seed_db):
    token = seed_db["engineer_token"]
    response = await client.post(
        "/api/v1/telemetry",
        headers=_auth(token),
        json={"serial_number": "SN-A1", "temperature": 30},
    )
    assert response.status_code == 403


async def test_telemetry_ingest_persists_sample(client, seed_db):
    token = seed_db["admin_token"]
    response = await client.post(
        "/api/v1/telemetry",
        headers=_auth(token),
        json={"serial_number": "SN-A1", "temperature": 71.5, "rms": 0.42},
    )
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["temperature"] == 71.5
    assert data["rms"] == 0.42


async def test_telemetry_ingest_unknown_device(client, seed_db):
    token = seed_db["admin_token"]
    response = await client.post(
        "/api/v1/telemetry",
        headers=_auth(token),
        json={"serial_number": "SN-UNKNOWN", "temperature": 30},
    )
    assert response.status_code == 404


async def _foreign_device_id(org_b_id: int) -> int:
    async with _TestSession() as s:
        result = await s.execute(
            Device.__table__.select().where(
                Device.organization_id == org_b_id
            ).limit(1)
        )
        row = result.one()
        return row.id
