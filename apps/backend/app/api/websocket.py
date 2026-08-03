import asyncio
import json
import random
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.manager import websocket_manager

router = APIRouter()


@router.websocket("/ws/telemetry")
async def telemetry_ws(ws: WebSocket):
    await websocket_manager.connect(ws)
    base = {"temp": 72.0, "press": 6.1, "humid": 46.0}
    try:
        while True:
            base["temp"] += random.uniform(-0.8, 0.8)
            base["press"] += random.uniform(-0.05, 0.05)
            base["humid"] += random.uniform(-0.6, 0.6)
            base["temp"] = min(85, max(60, base["temp"]))
            base["press"] = min(6.5, max(5.5, base["press"]))
            base["humid"] = min(55, max(35, base["humid"]))
            payload = json.dumps({
                "type": "telemetry",
                "data": {
                    "temp": round(base["temp"], 1),
                    "press": round(base["press"], 2),
                    "humid": round(base["humid"], 1),
                },
                "timestamp": asyncio.get_event_loop().time(),
            })
            await ws.send_text(payload)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        await websocket_manager.disconnect(ws)


_alert_seq = 0


@router.websocket("/ws/alerts")
async def alerts_ws(ws: WebSocket):
    global _alert_seq
    await websocket_manager.connect(ws)
    try:
        while True:
            await asyncio.sleep(random.randint(15, 40))
            _alert_seq += 1
            levels = ["critical", "warning", "info"]
            level = random.choice(levels)
            devices = [
                {"device_id": 7, "alarm_type": "Temperatura acima do limite", "value": 82.3, "threshold": 80.0},
                {"device_id": 4, "alarm_type": "Pressão variando fora da faixa", "value": 6.3, "threshold": 6.5},
                {"device_id": 21, "alarm_type": "Bateria baixa", "value": 18, "threshold": 20},
                {"device_id": 12, "alarm_type": "Dispositivo offline - sem heartbeat", "value": None, "threshold": None},
            ]
            dev = random.choice(devices)
            payload = json.dumps({
                "type": "alert",
                "data": {
                    "id": _alert_seq,
                    "device_id": dev["device_id"],
                    "alarm_type": dev["alarm_type"],
                    "level": level,
                    "value": dev["value"],
                    "threshold": dev["threshold"],
                    "acknowledged": False,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                },
            })
            await ws.send_text(payload)
    except WebSocketDisconnect:
        await websocket_manager.disconnect(ws)
