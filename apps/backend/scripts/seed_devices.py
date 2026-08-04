"""
Gera dispositivos virtuais, telemetria e alarmes para simular o sistema.
Uso: python -m scripts.seed_devices
"""

import asyncio
import json
import math
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func

from app.database.session import engine, async_session
from app.models.organization import Organization
from app.models.device import Device
from app.models.sample import Sample
from app.models.alert import Alert
from app.models.log import Log

NOW = datetime.now(timezone.utc)

DEVICES = [
    {"name": "PLC-07 Siemens S7-1500", "serial": "SIE-1500-007", "fw": "v4.2.1", "location": "Linha 3 - Painel Principal"},
    {"name": "Sensor-T21 ABB CT310", "serial": "ABB-CT310-021", "fw": "v3.1.0", "location": "Zona B - Tanque 4"},
    {"name": "Gateway-M04 Beckhoff CX9020", "serial": "BECK-CX9020-004", "fw": "v2.8.3", "location": "Rack 2 - Sala de Controle"},
    {"name": "RTU-Festo VTSA-44", "serial": "FES-VTSA44-008", "fw": "v5.0.1", "location": "Linha 1 - Valvulas"},
    {"name": "HMI-Panel Schneider HMISTU855", "serial": "SCH-HMISTU-010", "fw": "v6.3.0", "location": "Painel Operador 2"},
    {"name": "Sensor-P12 Phoenix RAD-2400", "serial": "PHX-RAD24-012", "fw": "v1.9.0", "location": "Zona A - Forno"},
    {"name": "Drive-Freq ABB ACS580", "serial": "ABB-ACS58-015", "fw": "v3.4.2", "location": "Linha 2 - Motor Principal"},
    {"name": "Sensor-Vib VibroSyst VIB10", "serial": "VSY-VIB10-020", "fw": "v4.1.0", "location": "Zona C - Bomba BC-001"},
    {"name": "Controladora PLC Central", "serial": "PLC-CENTRAL-001", "fw": "v5.0.2", "location": "Sala de Controle - Rack 1"},
    {"name": "Bomba Centrifuga BC-001", "serial": "BC-001-MOTOR", "fw": "v2.3.0", "location": "Zona C - Estacao de Bombas"},
    {"name": "Sensor-Nivel Ultrasonic", "serial": "ULTRASONIC-NV-01", "fw": "v1.8.2", "location": "Tanque 7 - Zona B"},
    {"name": "Gateway OPC-UA Principal", "serial": "GW-OPC-PRIME", "fw": "v4.1.2", "location": "Datacenter - Rack 3"},
]

ALERT_TYPES = [
    ("Temperatura acima do limite", "critical", 80.0),
    ("Vibracao excessiva detectada", "critical", 14.0),
    ("Pressao fora do range", "warning", 8.5),
    ("Bateria baixa", "warning", 20.0),
    ("Dispositivo offline", "critical", 0),
    ("Latencia elevada", "warning", 150),
    ("Uso de memoria alto", "warning", 85.0),
    ("Firmware desatualizado", "info", 0),
]


def sin_wave(base: float, amplitude: float, t: float, period: float = 24, noise: float = 0.1) -> float:
    v = base + amplitude * math.sin(2 * math.pi * t / period)
    v += random.gauss(0, noise * amplitude)
    return round(v, 2)


async def seed():
    async with async_session() as session:
        existing_count = await session.scalar(select(func.count(Device.id)))
        if existing_count and existing_count > 0:
            print(f"Banco ja possui {existing_count} dispositivos. Deseja recriar? (s/N)")
            # Auto-skip if DB already has data
            print("Para recriar, delete o banco e execute novamente.")

        org = await session.scalar(select(Organization).where(Organization.slug == "default"))

        print("Criando dispositivos...")
        device_map = {}
        for d in DEVICES:
            dev = Device(
                name=d["name"],
                serial_number=d["serial"],
                firmware_version=d["fw"],
                location=d["location"],
                organization_id=org.id,
                active=True,
            )
            session.add(dev)
            await session.flush()
            device_map[dev.id] = d
            print(f"  [{dev.id}] {d['name']}")

        await session.commit()
        print(f"\n{len(DEVICES)} dispositivos criados.\n")

        print("Gerando dados de telemetria (60 amostras por dispositivo)...")
        for dev_id in device_map:
            base_temp = random.uniform(45, 70)
            base_vib = random.uniform(2, 8)
            base_press = random.uniform(3, 7)
            for i in range(60):
                t = i * 0.5
                temp = sin_wave(base_temp, 10, t, 12, 0.15)
                vib_x = sin_wave(base_vib, 3, t, 8, 0.2)
                vib_y = sin_wave(base_vib * 0.8, 2, t, 8, 0.2)
                vib_z = sin_wave(base_vib * 0.6, 1.5, t, 8, 0.2)
                rms_val = round(math.sqrt(vib_x**2 + vib_y**2 + vib_z**2) / math.sqrt(3), 2)
                peak_val = round(max(abs(vib_x), abs(vib_y), abs(vib_z)), 2)
                crest = round(peak_val / max(rms_val, 0.01), 2)
                press = sin_wave(base_press, 1.5, t, 16, 0.1)
                kurt = round(random.uniform(2.5, 4.5), 2)
                recorded_at = NOW - timedelta(hours=30) + timedelta(hours=i * 0.5)

                sample = Sample(
                    device_id=dev_id,
                    temperature=temp,
                    vibration_x=vib_x,
                    vibration_y=vib_y,
                    vibration_z=vib_z,
                    rms=rms_val,
                    peak=peak_val,
                    crest_factor=crest,
                    kurtosis=kurt,
                    recorded_at=recorded_at,
                )
                session.add(sample)
            if dev_id % 3 == 0:
                print(f"  {dev_id}/{len(device_map)}...")
        await session.commit()
        print("Telemetria gerada.\n")

        print("Gerando alarmes...")
        alert_count = 0
        for dev_id in device_map:
            num_alerts = random.randint(1, 3)
            for _ in range(num_alerts):
                alarm_type, level, threshold = random.choice(ALERT_TYPES)
                value = round(random.uniform(threshold * 0.85, threshold * 1.3), 1)
                ack = random.random() < 0.4
                created_at = NOW - timedelta(hours=random.randint(1, 72), minutes=random.randint(0, 59))
                alert = Alert(
                    device_id=dev_id,
                    alarm_type=alarm_type,
                    level=level,
                    value=value,
                    threshold=threshold,
                    acknowledged=ack,
                    created_at=created_at,
                )
                session.add(alert)
                alert_count += 1
        await session.commit()
        print(f"{alert_count} alarmes criados.\n")

        print("Gerando logs...")
        log_sources = ["MQTT Broker", "Modbus RTU", "OTA Manager", "Telemetry", "Gateway", "Auth Service"]
        log_levels = ["info", "info", "info", "warn", "warn", "err"]
        log_msgs = [
            "Conexao estabelecida com broker MQTT",
            "Leitura de registro Modbus concluida",
            "Heartbeat recebido do dispositivo",
            "Pacote de telemetria processado",
            "Timeout na comunicacao serial",
            "Alerta de memoria: heap acima de 80%",
            "Firmware atualizado via OTA",
            "Autenticacao realizada com sucesso",
            "Dispositivo reconectado apos queda",
            "Cache de dados limpo com sucesso",
        ]
        log_count = 0
        for dev_id in device_map:
            for _ in range(random.randint(3, 8)):
                log = Log(
                    device_id=dev_id,
                    level=random.choice(log_levels),
                    source=random.choice(log_sources),
                    message=random.choice(log_msgs),
                    created_at=NOW - timedelta(hours=random.randint(0, 72), minutes=random.randint(0, 59)),
                )
                session.add(log)
                log_count += 1
        await session.commit()
        print(f"{log_count} logs criados.\n")

        print("=== SEMENTE CONCLUIDA ===")
        print(f"  Dispositivos: {len(DEVICES)}")
        print(f"  Amostras: {len(DEVICES) * 60}")
        print(f"  Alarmes: {alert_count}")
        print(f"  Logs: {log_count}")


if __name__ == "__main__":
    asyncio.run(seed())
