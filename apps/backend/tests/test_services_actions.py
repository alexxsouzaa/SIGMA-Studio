from app.services.alert_service import AlertService
from app.services.log_service import LogService


async def test_acknowledge_all_marks_unacknowledged(seeded_session):
    service = AlertService(seeded_session)
    count = await service.acknowledge_all()

    assert count == 1
    alerts, _ = await service.list_alerts()
    assert all(a.acknowledged for a in alerts)


async def test_acknowledge_all_idempotent(seeded_session):
    service = AlertService(seeded_session)
    await service.acknowledge_all()
    assert await service.acknowledge_all() == 0


async def test_clear_logs_removes_all(seeded_session):
    service = LogService(seeded_session)
    await service.create_log(level="info", source="test", message="hello")
    await service.create_log(level="err", source="test", message="world")

    assert await service.clear_logs() == 2

    logs, total = await service.list_logs()
    assert logs == []
    assert total == 0


async def test_clear_logs_empty_database(session):
    service = LogService(session)
    assert await service.clear_logs() == 0
