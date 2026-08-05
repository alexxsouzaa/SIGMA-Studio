from app.models.alert import Alert
from app.models.device import Device
from app.models.sample import Sample
from app.services.realtime_service import RealtimeService


async def test_new_samples_since_returns_incrementals(seeded_session):
    device = await seeded_session.get(Device, 1)
    for i in range(3):
        seeded_session.add(Sample(device_id=device.id, temperature=40 + i))
    await seeded_session.commit()

    service = RealtimeService(seeded_session)
    samples = await service.new_samples_since(0)

    assert [s.id for s in samples] == sorted(s.id for s in samples)
    assert len(samples) == 3
    assert [s.temperature for s in samples] == [40, 41, 42]

    tail = await service.new_samples_since(samples[0].id)
    assert len(tail) == 2
    assert tail[0].id > samples[0].id


async def test_new_samples_since_filters_by_device(seeded_session):
    first = await seeded_session.get(Device, 1)
    second = Device(
        organization_id=first.organization_id,
        name="DEV-02",
        serial_number="SN-002",
        firmware_version="1.0.0",
        active=True,
    )
    seeded_session.add(second)
    await seeded_session.flush()
    seeded_session.add(Sample(device_id=first.id, temperature=1))
    seeded_session.add(Sample(device_id=second.id, temperature=2))
    await seeded_session.commit()

    service = RealtimeService(seeded_session)
    only_first = await service.new_samples_since(0, device_id=first.id)
    only_second = await service.new_samples_since(0, device_id=second.id)

    assert [s.temperature for s in only_first] == [1]
    assert [s.temperature for s in only_second] == [2]


async def test_recent_unacknowledged_alerts_excludes_acknowledged(seeded_session):
    service = RealtimeService(seeded_session)
    alerts = await service.recent_unacknowledged_alerts()

    assert len(alerts) == 1
    assert alerts[0].alarm_type == "Temperatura"
    assert alerts[0].acknowledged is False


async def test_new_alerts_since_returns_only_newer(seeded_session):
    device = await seeded_session.get(Device, 1)
    seeded_session.add(
        Alert(device_id=device.id, alarm_type="RMS", level="critical")
    )
    await seeded_session.commit()

    service = RealtimeService(seeded_session)
    new = await service.new_alerts_since(0)

    assert any(a.alarm_type == "RMS" for a in new)
    assert all(a.id > 0 for a in new)
    assert not [a for a in new if a.alarm_type == "RMS" and a.acknowledged]
