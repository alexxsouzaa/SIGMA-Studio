from app.services.dashboard_service import DashboardService


async def test_get_summary_counts(seeded_session):
    service = DashboardService(seeded_session)
    summary = await service.get_summary()

    assert summary["total_devices"] == 1
    assert summary["active_devices"] == 1
    assert summary["inactive_devices"] == 0
    assert summary["total_alerts"] == 2
    assert summary["active_alerts"] == 1
    assert summary["critical_alerts"] == 1


async def test_get_summary_empty_database(session):
    service = DashboardService(session)
    summary = await service.get_summary()

    assert summary == {
        "total_devices": 0,
        "active_devices": 0,
        "inactive_devices": 0,
        "total_alerts": 0,
        "active_alerts": 0,
        "critical_alerts": 0,
        "messages_per_minute": 0,
    }


async def test_get_summary_messages_per_minute(seeded_session):
    service = DashboardService(seeded_session)
    summary = await service.get_summary(messages_per_minute=150)

    assert summary["messages_per_minute"] == 150


async def test_get_protocols(seeded_session):
    service = DashboardService(seeded_session)
    protocols = await service.get_protocols()

    assert len(protocols) == 1
    assert protocols[0]["name"] == "MQTT"
    assert protocols[0]["device_count"] == 3
    assert protocols[0]["gateway_count"] == 1
    assert protocols[0]["pct"] == 100.0


async def test_get_protocols_empty_database(session):
    service = DashboardService(session)
    protocols = await service.get_protocols()

    assert protocols == []


async def test_get_gateway_summary(seeded_session):
    service = DashboardService(seeded_session)
    gateways = await service.get_gateway_summary()

    assert len(gateways) == 1
    assert gateways[0]["name"] == "GW-MQTT"
    assert gateways[0]["protocol"] == "MQTT"
    assert gateways[0]["status"] == "online"


async def test_get_ai_insights(seeded_session):
    service = DashboardService(seeded_session)
    models = await service.get_ai_insights()

    assert len(models) == 1
    assert models[0]["name"] == "anomaly-v1"
    assert models[0]["type"] == "anomaly"
    assert models[0]["status"] == "production"
    assert models[0]["accuracy"] == 0.92
