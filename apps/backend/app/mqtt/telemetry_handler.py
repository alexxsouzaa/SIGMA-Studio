import json
import logging
from datetime import datetime

from sqlalchemy import select

from app.database.session import async_session
from app.models.organization import Organization
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

# Cache processo-memória org → id (ADR-002): evita uma query por mensagem.
# Ref é o slug ou o id textual; não é cacheado quando a org não é encontrada.
_ORG_ID_CACHE: dict[str, int] = {}


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


def parse_topic(topic: str) -> tuple[str | None, str | None]:
    """Classifica o tópico de telemetria (ADR-002).

    Retorna ``(org_ref, serial)``:
    - ``sigma/{serial}/telemetry`` → ``(None, serial)`` (legado);
    - ``sigma/{org}/{serial}/telemetry`` → ``(org_ref, serial)`` (canônico).
    """
    parts = topic.split("/")
    if len(parts) == 3:
        return None, parts[1]
    if len(parts) == 4:
        return parts[1], parts[2]
    return None, None


async def resolve_org_id(session, org_ref: str) -> int | None:
    """Resolve a organização do tópico por id numérico ou slug (com cache)."""
    cached = _ORG_ID_CACHE.get(org_ref)
    if cached is not None:
        return cached
    if org_ref.isdigit():
        org = await session.get(Organization, int(org_ref))
    else:
        result = await session.execute(
            select(Organization).where(Organization.slug == org_ref)
        )
        org = result.scalar_one_or_none()
    if org is None:
        return None
    _ORG_ID_CACHE[org_ref] = org.id
    return org.id


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
    """Callback registrado para ``sigma/+/telemetry`` e ``sigma/+/+/telemetry``.

    Tópicos org-scoped (4 níveis) resolvem o device **dentro da organização**
    (ADR-002); tópicos legados (3 níveis) mantêm a resolução global atual.
    """
    try:
        body = json.loads(payload.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        logger.warning("MQTT telemetry: payload inválido no tópico %s", topic)
        return

    org_ref, serial = parse_topic(topic)
    if not serial:
        logger.warning("MQTT telemetry: tópico sem identificador: %s", topic)
        return

    data = build_sample_create(serial, body)
    async with async_session() as session:
        service = TelemetryService(session)
        if org_ref is not None:
            org_id = await resolve_org_id(session, org_ref)
            if org_id is None:
                logger.warning(
                    "MQTT telemetry: organização %s não encontrada (tópico %s)",
                    org_ref,
                    topic,
                )
                return
            sample = await service.ingest(data, organization_ids={org_id})
        else:
            sample = await service.ingest(data)
        if sample is None:
            logger.warning("MQTT telemetry: dispositivo %s não encontrado", serial)
