import pytest

from app.mqtt.manager import _topic_matches
from app.mqtt.telemetry_handler import (
    _ORG_ID_CACHE,
    ingest_mqtt_telemetry,
    parse_topic,
    resolve_org_id,
)
from app.schemas.telemetry import TelemetrySampleCreate
from app.services.telemetry_service import TelemetryService


@pytest.fixture(autouse=True)
def _clear_org_cache():
    _ORG_ID_CACHE.clear()
    yield
    _ORG_ID_CACHE.clear()


@pytest.mark.parametrize(
    "topic,org_ref,serial",
    [
        ("sigma/SN-001/telemetry", None, "SN-001"),
        ("sigma/test-org/SN-001/telemetry", "test-org", "SN-001"),
        ("sigma/test-org/SN-001/status", "test-org", "SN-001"),
        ("sigma/SN-001", None, None),
        ("sigma", None, None),
        ("outra/coisa/telemetry", None, "coisa"),
    ],
)
def test_parse_topic_classifies_legacy_and_canonical(topic, org_ref, serial):
    assert parse_topic(topic) == (org_ref, serial)


async def test_resolve_org_by_slug(seeded_session):
    org_id = await resolve_org_id(seeded_session, "test-org")
    assert org_id is not None
    assert _ORG_ID_CACHE["test-org"] == org_id


async def test_resolve_org_by_numeric_id(seeded_session):
    org_id = await resolve_org_id(seeded_session, "1")
    assert org_id == 1


async def test_resolve_unknown_org_returns_none(seeded_session):
    assert await resolve_org_id(seeded_session, "org-inexistente") is None
    assert "org-inexistente" not in _ORG_ID_CACHE


async def test_ingest_scoped_to_org_accepts_device_da_org(seeded_session):
    org_id = await resolve_org_id(seeded_session, "test-org")
    service = TelemetryService(seeded_session)
    sample = await service.ingest(
        TelemetrySampleCreate(serial_number="SN-001", temperature=42.5),
        organization_ids={org_id},
    )
    assert sample is not None
    assert sample.device_id == 1


async def test_ingest_scoped_to_outra_org_rejeita_device(seeded_session):
    service = TelemetryService(seeded_session)
    sample = await service.ingest(
        TelemetrySampleCreate(serial_number="SN-001", temperature=42.5),
        organization_ids={999},
    )
    assert sample is None


@pytest.mark.parametrize(
    "pattern,topic,expected",
    [
        ("sigma/+/+/telemetry", "sigma/test-org/SN-001/telemetry", True),
        ("sigma/+/+/telemetry", "sigma/SN-001/telemetry", False),
        ("sigma/+/+/telemetry", "sigma/test-org/SN-001/status", False),
        ("sigma/+/telemetry", "sigma/SN-001/telemetry", True),
        ("sigma/+/telemetry", "sigma/test-org/SN-001/telemetry", False),
    ],
)
def test_topic_matching_org_scoped(pattern, topic, expected):
    assert _topic_matches(pattern, topic) is expected


class _SessionCtx:
    def __init__(self, session):
        self._session = session

    async def __aenter__(self):
        return self._session

    async def __aexit__(self, *args):
        return False


async def test_handler_org_scoped_ingere_na_org(seeded_session, monkeypatch):
    from sqlalchemy import func, select

    from app.mqtt import telemetry_handler as handler
    from app.models.sample import Sample

    monkeypatch.setattr(handler, "async_session", lambda: _SessionCtx(seeded_session))

    payload = b'{"temperature": 25.3, "rms": 0.4, "timestamp": "2026-08-07T12:00:00Z"}'
    await ingest_mqtt_telemetry("sigma/test-org/SN-001/telemetry", payload)

    count = await seeded_session.scalar(select(func.count(Sample.id)))
    assert count == 1


async def test_handler_topic_legado_continua_ingerindo(seeded_session, monkeypatch):
    from sqlalchemy import func, select

    from app.mqtt import telemetry_handler as handler
    from app.models.sample import Sample

    monkeypatch.setattr(handler, "async_session", lambda: _SessionCtx(seeded_session))

    payload = b'{"temperature": 25.3, "rms": 0.4, "timestamp": "2026-08-07T12:00:00Z"}'
    await ingest_mqtt_telemetry("sigma/SN-001/telemetry", payload)

    count = await seeded_session.scalar(select(func.count(Sample.id)))
    assert count == 1


async def test_handler_org_scoped_org_inexistente_descarta(seeded_session, monkeypatch):
    from sqlalchemy import func, select

    from app.mqtt import telemetry_handler as handler
    from app.models.sample import Sample

    monkeypatch.setattr(handler, "async_session", lambda: _SessionCtx(seeded_session))

    payload = b'{"temperature": 25.3}'
    await ingest_mqtt_telemetry("sigma/org-fantasma/SN-001/telemetry", payload)

    count = await seeded_session.scalar(select(func.count(Sample.id)))
    assert count == 0
