import asyncio
import json
from collections.abc import Callable
import paho.mqtt.client as mqtt


class MqttManager:
    def __init__(self, broker: str, port: int, topic_prefix: str):
        self._broker = broker
        self._port = port
        self._topic_prefix = topic_prefix
        self._client = mqtt.Client()
        self._callbacks: dict[str, list[Callable]] = {}

    def on_message(self, topic: str, callback: Callable):
        self._callbacks.setdefault(topic, []).append(callback)

    async def connect(self) -> bool:
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, self._client.connect, self._broker, self._port, 60)
            self._client.on_message = self._handle_message
            self._client.loop_start()
            self._client.subscribe(f"{self._topic_prefix}/#")
            return result == mqtt.CONNACK_ACCEPTED
        except Exception:
            return False

    async def disconnect(self):
        self._client.loop_stop()
        self._client.disconnect()

    async def publish(self, topic: str, payload: dict):
        full_topic = f"{self._topic_prefix}/{topic}"
        self._client.publish(full_topic, json.dumps(payload))

    def _handle_message(self, _client, _userdata, msg):
        topic = msg.topic
        if topic in self._callbacks:
            for cb in self._callbacks[topic]:
                cb(msg.payload)
