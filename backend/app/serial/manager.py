import asyncio
from serial import Serial, SerialException


class SerialManager:
    def __init__(self, port: str, baudrate: int = 115200):
        self._port = port
        self._baudrate = baudrate
        self._serial: Serial | None = None
        self._running = False

    async def connect(self) -> bool:
        if not self._port:
            return False
        try:
            self._serial = Serial(self._port, self._baudrate, timeout=1)
            self._running = True
            return True
        except SerialException:
            self._serial = None
            return False

    async def disconnect(self):
        self._running = False
        if self._serial and self._serial.is_open:
            self._serial.close()
        self._serial = None

    async def read_line(self) -> str | None:
        if not self._serial or not self._serial.is_open:
            return None
        try:
            line = await asyncio.get_event_loop().run_in_executor(None, self._serial.readline)
            return line.decode("utf-8", errors="replace").strip()
        except SerialException:
            return None

    async def write(self, data: str):
        if self._serial and self._serial.is_open:
            await asyncio.get_event_loop().run_in_executor(None, self._serial.write, data.encode())
