import asyncio
import json
from collections.abc import Callable
import inspect
import paho.mqtt.client as mqtt


def _topic_matches(pattern: str, topic: str) -> bool:
    """MQTT-style matching supporting ``+`` (single level) and ``#`` (multi level)."""
    pattern_parts = pattern.split("/")
    topic_parts = topic.split("/")
    for i, part in enumerate(pattern_parts):
        if part == "#":
            return True
        if i >= len(topic_parts):
            return False
        if part == "+":
            continue
        if part != topic_parts[i]:
            return False
    return len(pattern_parts) == len(topic_parts)


class MqttManager:
    def __init__(self, broker: str, port: int, topic_prefix: str):
        self._broker = broker
        self._port = port
        self._topic_prefix = topic_prefix
        self._client = mqtt.Client()
        self._callbacks: list[tuple[str, Callable]] = []
        self._message_count: int = 0
        self._loop: asyncio.AbstractEventLoop | None = None

    def on_message(self, topic_pattern: str, callback: Callable):
        self._callbacks.append((topic_pattern, callback))

    async def connect(self) -> bool:
        try:
            self._loop = asyncio.get_event_loop()
            result = await self._loop.run_in_executor(None, self._client.connect, self._broker, self._port, 60)
            self._client.on_message = self._handle_message
            self._client.loop_start()
            self._client.subscribe(f"{self._topic_prefix}/#")
            return result == mqtt.CONNACK_ACCEPTED
        except Exception:
            return False

    async def disconnect(self):
        self._client.loop_stop()
        if self._client.is_connected():
            self._client.disconnect()

    async def publish(self, topic: str, payload: dict):
        full_topic = f"{self._topic_prefix}/{topic}"
        self._client.publish(full_topic, json.dumps(payload))

    def get_message_rate(self) -> int:
        count = self._message_count
        self._message_count = 0
        return count

    def _handle_message(self, _client, _userdata, msg):
        self._message_count += 1
        for pattern, callback in self._callbacks:
            if not _topic_matches(pattern, msg.topic):
                continue
            result = callback(msg.topic, msg.payload)
            if inspect.isawaitable(result) and self._loop is not None:
                asyncio.run_coroutine_threadsafe(result, self._loop)
