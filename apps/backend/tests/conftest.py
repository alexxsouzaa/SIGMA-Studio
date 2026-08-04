import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.pool import StaticPool

from app.database.session import Base
from app.models.organization import Organization
from app.models.device import Device
from app.models.alert import Alert
from app.models.gateway import Gateway
from app.models.ai_model import AIModel


@pytest_asyncio.fixture
async def session():
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as s:
        yield s

    await engine.dispose()


@pytest_asyncio.fixture
async def seeded_session(session):
    org = Organization(name="Test Org", slug="test-org")
    session.add(org)
    await session.flush()

    gateway = Gateway(
        organization_id=org.id,
        name="GW-MQTT",
        protocol="MQTT",
        status="online",
        devices_count=3,
    )
    session.add(gateway)

    device = Device(
        organization_id=org.id,
        name="DEV-01",
        serial_number="SN-001",
        firmware_version="1.0.0",
        active=True,
    )
    session.add(device)
    await session.flush()

    session.add(Alert(device_id=device.id, alarm_type="Temperatura", level="critical"))
    session.add(
        Alert(
            device_id=device.id,
            alarm_type="Vibração",
            level="warning",
            acknowledged=True,
        )
    )
    session.add(
        AIModel(
            name="anomaly-v1",
            type="anomaly",
            status="production",
            accuracy=0.92,
            description="Detecção de anomalia",
        )
    )
    await session.commit()
    return session
