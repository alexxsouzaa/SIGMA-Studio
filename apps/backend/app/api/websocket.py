import asyncio
import json
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.database.session import async_session
from app.models.device import Device
from app.models.user import User
from app.services.realtime_service import RealtimeService
from app.api.deps import get_user_scope
from app.utils.auth import decode_token
from app.websocket.manager import websocket_manager

router = APIRouter()

_UNAUTHORIZED_CODE = 4401
_FORBIDDEN_CODE = 4403
_TELEMETRY_POLL_SECONDS = 2
_ALERT_POLL_SECONDS = 5

_ACCESS_COOKIE = "access_token"


def _alert_payload(alert) -> dict:
    return {
        "type": "alert",
        "data": {
            "id": alert.id,
            "device_id": alert.device_id,
            "alarm_type": alert.alarm_type,
            "level": alert.level,
            "value": alert.value,
            "threshold": alert.threshold,
            "acknowledged": alert.acknowledged,
            "created_at": alert.created_at.isoformat() if alert.created_at else None,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def _sample_payload(sample) -> dict:
    return {
        "type": "telemetry",
        "data": {
            "id": sample.id,
            "device_id": sample.device_id,
            "temp": sample.temperature,
            "vibration_x": sample.vibration_x,
            "vibration_y": sample.vibration_y,
            "vibration_z": sample.vibration_z,
            "rms": sample.rms,
            "recorded_at": sample.recorded_at.isoformat() if sample.recorded_at else None,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


async def _authenticated_user(ws: WebSocket) -> User | None:
    token = ws.cookies.get(_ACCESS_COOKIE)
    if not token:
        return None
    payload = decode_token(token)
    if not payload or payload.get("type") != "access" or not payload.get("sub"):
        return None
    async with async_session() as session:
        user = await session.get(User, int(payload["sub"]))
        if not user or not user.active:
            return None
        return user


@router.websocket("/ws/telemetry")
async def telemetry_ws(ws: WebSocket):
    user = await _authenticated_user(ws)
    if not user:
        await ws.close(code=_UNAUTHORIZED_CODE)
        return

    device_id: int | None = None
    raw_device = ws.query_params.get("device_id")
    if raw_device is not None:
        try:
            device_id = int(raw_device)
        except ValueError:
            pass

    async with async_session() as session:
        scope = await get_user_scope(user, session)
        if scope is not None and device_id is not None:
            device = await session.get(Device, device_id)
            if not device or device.organization_id not in scope:
                await ws.close(code=_FORBIDDEN_CODE)
                return

    await websocket_manager.connect(ws)
    last_id = 0
    try:
        while True:
            async with async_session() as session:
                service = RealtimeService(session)
                samples = await service.new_samples_since(
                    last_id, device_id=device_id, organization_ids=scope
                )
            for sample in samples:
                await ws.send_text(json.dumps(_sample_payload(sample)))
                last_id = sample.id
            await asyncio.sleep(_TELEMETRY_POLL_SECONDS)
    except WebSocketDisconnect:
        await websocket_manager.disconnect(ws)


@router.websocket("/ws/alerts")
async def alerts_ws(ws: WebSocket):
    user = await _authenticated_user(ws)
    if not user:
        await ws.close(code=_UNAUTHORIZED_CODE)
        return

    async with async_session() as session:
        scope = await get_user_scope(user, session)

    await websocket_manager.connect(ws)
    last_id = 0
    try:
        while True:
            async with async_session() as session:
                service = RealtimeService(session)
                if last_id == 0:
                    alerts = await service.recent_unacknowledged_alerts(
                        organization_ids=scope
                    )
                else:
                    alerts = [
                        a
                        for a in await service.new_alerts_since(
                            last_id, organization_ids=scope
                        )
                        if not a.acknowledged
                    ]
            for alert in alerts:
                await ws.send_text(json.dumps(_alert_payload(alert)))
                last_id = max(last_id, alert.id)
            await asyncio.sleep(_ALERT_POLL_SECONDS)
    except WebSocketDisconnect:
        await websocket_manager.disconnect(ws)
