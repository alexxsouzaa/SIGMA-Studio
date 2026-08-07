"""Conformidade com o Device SDK (ADR-001 / Fase 7.1).

A fonte da verdade do contrato vive em ``SIGMA-Emu/packages/device-sdk`` (spec/).
Esta copia sincronizada (``apps/backend/sdk/``, via ``npm run sync:studio -w
packages/device-sdk``) alimenta este teste, garantindo que os schemas Pydantic
do backend nao sofram drift em relacao ao contrato unico do ecossistema.
"""

import json
from pathlib import Path

from app.schemas.device import DeviceCreate
from app.schemas.telemetry import TelemetrySampleCreate

SDK_DIR = Path(__file__).resolve().parents[1] / "sdk"


def _load(relative: str) -> dict:
    with open(SDK_DIR / relative, encoding="utf-8") as fh:
        return json.load(fh)


def test_telemetry_golden_fixture_aceito_pelo_pydantic():
    fixture = _load("fixtures/telemetry-sample.golden.json")
    model = TelemetrySampleCreate(**fixture)
    assert model.serial_number == "SIGMA-MONITOR-0001"
    assert model.temperature == 25.31
    assert model.vibration_z == 0.21
    assert model.crest_factor == 2.53
    assert model.kurtosis == 3.11


def test_telemetry_schema_pydantic_compativel_com_spec_canonica():
    canonical = _load("spec/telemetry-sample.json")
    pydantic_schema = TelemetrySampleCreate.model_json_schema()
    for prop in canonical["properties"]:
        assert prop in pydantic_schema["properties"], (
            f"propriedade canonica '{prop}' ausente no schema Pydantic"
        )
    for prop in ("serial_number", "device_id", "temperature", "recorded_at"):
        assert prop in pydantic_schema["properties"]


def test_telemetry_fixture_fora_do_contrato_e_rejeitado():
    fixture = _load("fixtures/telemetry-sample.golden.json")
    del fixture["serial_number"]
    try:
        TelemetrySampleCreate(**fixture)
    except ValueError:
        return
    raise AssertionError("amostra sem serial_number/device_id deveria ser rejeitada")


def test_device_create_aceita_identidade_do_emulador():
    identity = _load("fixtures/device-identity.golden.json")
    model = DeviceCreate(
        organization_id=1,
        name=identity["model"],
        serial_number=identity["serial"],
        firmware_version=identity["firmwareVersion"],
        is_emulated=identity.get("isEmulated", True),
    )
    assert model.is_emulated is True
    assert model.serial_number == "SIGMA-MONITOR-0001"
