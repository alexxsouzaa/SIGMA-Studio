import json
import logging
from datetime import datetime

from app.database.session import async_session
from app.schemas.telemetry import TelemetrySampleCreate
from app.services.telemetry_service import TelemetryService

logger = logging.getLogger(__name__)

_FIELD_ALIASES = {
    "temperature": ("temperature", "temp", "temp_c"),
    "vibration_x": ("vibration_x", "vib_x", "vibrationX"),
    "vibration_y": ("vibration_y", "vib_y", "vibrationY"),
    "vibration_z": ("vibration_z", "vib_z", "vibrationZ"),
    "rms": ("rms", "vibration_rms", "rms_g"),
    "peak": ("peak", "peak_g"),
    "crest_factor": ("crest_factor", "crest"),
    "kurtosis": ("kurtosis", "kurt"),
    "recorded_at": ("recorded_at", "timestamp", "time"),
}


def _pick(payload: dict, field: str) -> float | str | None:
    for key in _FIELD_ALIASES[field]:
        if key in payload and payload[key] is not None:
            return payload[key]
    return None


def _parse_recorded_at(raw) -> datetime | None:
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return datetime.fromtimestamp(raw)
    try:
        text = str(raw).replace("Z", "+00:00")
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def build_sample_create(serial: str, payload: dict) -> TelemetrySampleCreate:
    return TelemetrySampleCreate(
        serial_number=serial,
        temperature=_pick(payload, "temperature"),
        vibration_x=_pick(payload, "vibration_x"),
        vibration_y=_pick(payload, "vibration_y"),
        vibration_z=_pick(payload, "vibration_z"),
        rms=_pick(payload, "rms"),
        peak=_pick(payload, "peak"),
        crest_factor=_pick(payload, "crest_factor"),
        kurtosis=_pick(payload, "kurtosis"),
        recorded_at=_parse_recorded_at(_pick(payload, "recorded_at")),
    )


async def ingest_mqtt_telemetry(topic: str, payload: bytes):
    """Callback registrado para ``sigma/+/telemetry``.

    O serial é extraído do tópico; o restante vem do payload JSON.
    """
    try:
        body = json.loads(payload.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        logger.warning("MQTT telemetry: payload inválido no tópico %s", topic)
        return

    serial = topic.split("/")[1] if topic.count("/") >= 1 else None
    if not serial:
        logger.warning("MQTT telemetry: tópico sem identificador: %s", topic)
        return

    data = build_sample_create(serial, body)
    async with async_session() as session:
        service = TelemetryService(session)
        sample = await service.ingest(data)
        if sample is None:
            logger.warning("MQTT telemetry: dispositivo %s não encontrado", serial)
