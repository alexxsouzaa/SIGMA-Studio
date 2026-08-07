from app.models.device import Device
from app.models.organization import Organization
from app.repositories.device_repository import DeviceRepository
from app.schemas.device import DeviceCreate, DeviceResponse, DeviceUpdate
from app.services.device_service import DeviceService


async def _seed_emulated_device(session, org_id: int, *, is_emulated: bool) -> Device:
    device = Device(
        organization_id=org_id,
        name=f"EMU-{is_emulated}",
        serial_number=f"EMU-SN-{is_emulated}",
        firmware_version="1.0.0",
        is_emulated=is_emulated,
    )
    session.add(device)
    await session.commit()
    await session.refresh(device)
    return device


def test_device_create_defaults_to_real():
    data = DeviceCreate(
        organization_id=1, name="DEV", serial_number="SN-001"
    )
    assert data.is_emulated is False


def test_device_create_accepts_emulated_flag():
    data = DeviceCreate(
        organization_id=1,
        name="EMU",
        serial_number="SN-002",
        is_emulated=True,
    )
    assert data.is_emulated is True


async def test_device_response_includes_is_emulated(session):
    device = Device(
        organization_id=1,
        name="EMU",
        serial_number="SN-003",
        firmware_version="1.0.0",
        is_emulated=True,
    )
    session.add(device)
    await session.commit()
    await session.refresh(device)

    response = DeviceResponse.model_validate(device)
    assert response.is_emulated is True


async def test_create_device_persists_is_emulated(session):
    org = Organization(name="Emu Org", slug="emu-org")
    session.add(org)
    await session.flush()

    service = DeviceService(DeviceRepository(session))
    device = await service.create_device(
        DeviceCreate(
            organization_id=org.id,
            name="EMU-01",
            serial_number="SN-EMU-01",
            is_emulated=True,
        )
    )
    assert device.is_emulated is True

    created = await service.get_device(device.id)
    assert created is not None
    assert created.is_emulated is True


async def test_list_filters_emulated(session):
    org = Organization(name="Emu Org", slug="emu-org")
    session.add(org)
    await session.flush()

    await _seed_emulated_device(session, org.id, is_emulated=True)
    await _seed_emulated_device(session, org.id, is_emulated=True)
    await _seed_emulated_device(session, org.id, is_emulated=False)

    repo = DeviceRepository(session)

    all_devices, all_total = await repo.list_all(), await repo.count()
    assert len(all_devices) == 3
    assert all_total == 3

    emulated, emulated_total = await repo.list_all(is_emulated=True), await repo.count(
        is_emulated=True
    )
    assert len(emulated) == 2
    assert emulated_total == 2
    assert all(d.is_emulated for d in emulated)

    real, real_total = await repo.list_all(is_emulated=False), await repo.count(
        is_emulated=False
    )
    assert len(real) == 1
    assert real_total == 1
    assert all(not d.is_emulated for d in real)


async def test_service_list_filters_emulated(session):
    org = Organization(name="Emu Org", slug="emu-org")
    session.add(org)
    await session.flush()

    await _seed_emulated_device(session, org.id, is_emulated=True)
    await _seed_emulated_device(session, org.id, is_emulated=False)

    service = DeviceService(DeviceRepository(session))
    emulated, total = await service.list_devices(is_emulated=True)
    assert total == 1
    assert emulated[0].is_emulated is True


async def test_update_device_flips_is_emulated(session):
    org = Organization(name="Emu Org", slug="emu-org")
    session.add(org)
    await session.flush()

    device = await _seed_emulated_device(session, org.id, is_emulated=False)
    service = DeviceService(DeviceRepository(session))

    updated = await service.update_device(device.id, DeviceUpdate(is_emulated=True))
    assert updated is not None
    assert updated.is_emulated is True
