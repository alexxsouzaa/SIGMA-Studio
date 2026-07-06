import json
from typing import Any
from fastapi import WebSocket


class WebSocketManager:
    def __init__(self):
        self._connections: set[WebSocket] = set()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self._connections.add(ws)

    async def disconnect(self, ws: WebSocket):
        self._connections.discard(ws)

    async def disconnect_all(self):
        for ws in list(self._connections):
            try:
                await ws.close()
            except Exception:
                pass
        self._connections.clear()

    async def broadcast(self, data: dict[str, Any]):
        payload = json.dumps(data)
        stale = set()
        for ws in self._connections:
            try:
                await ws.send_text(payload)
            except Exception:
                stale.add(ws)
        self._connections -= stale


websocket_manager = WebSocketManager()
