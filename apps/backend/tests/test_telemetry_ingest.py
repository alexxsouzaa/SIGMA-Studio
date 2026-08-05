import pytest

from app.mqtt.manager import _topic_matches
from app.schemas.telemetry import TelemetrySampleCreate
from app.services.telemetry_service import TelemetryService


async def test_ingest_by_serial(seeded_session):
    service = TelemetryService(seeded_session)
    sample = await service.ingest(
        TelemetrySampleCreate(serial_number="SN-001", temperature=42.5, rms=0.3)
    )
    assert sample is not None
    assert sample.temperature == 42.5
    assert sample.rms == 0.3
    assert sample.device_id == 1


async def test_ingest_by_device_id(seeded_session):
    service = TelemetryService(seeded_session)
    sample = await service.ingest(
        TelemetrySampleCreate(device_id=1, vibration_x=1.1, vibration_y=1.2)
    )
    assert sample is not None
    assert sample.vibration_x == 1.1
    assert sample.vibration_y == 1.2


async def test_ingest_unknown_serial_returns_none(seeded_session):
    service = TelemetryService(seeded_session)
    sample = await service.ingest(TelemetrySampleCreate(serial_number="SN-UNKNOWN"))
    assert sample is None


async def test_resolve_device_scoped_to_org(seeded_session):
    service = TelemetryService(seeded_session)
    device = await service.resolve_device(serial_number="SN-001", organization_ids={999})
    assert device is None


def test_schema_requires_device_identifier():
    with pytest.raises(ValueError):
        TelemetrySampleCreate(temperature=30.0)


@pytest.mark.parametrize(
    "pattern,topic,expected",
    [
        ("sigma/+/telemetry", "sigma/SN-001/telemetry", True),
        ("sigma/+/telemetry", "sigma/SN-001/status", False),
        ("sigma/+/telemetry", "sigma/a/b/telemetry", False),
        ("sigma/#", "sigma/SN-001/telemetry", True),
        ("sigma/#", "sigma/SN-001/status", True),
        ("sigma/+/telemetry", "sigma/+/telemetry", True),
        ("sigma/+/telemetry", "other/SN-001/telemetry", False),
    ],
)
def test_topic_matching(pattern, topic, expected):
    assert _topic_matches(pattern, topic) is expected
