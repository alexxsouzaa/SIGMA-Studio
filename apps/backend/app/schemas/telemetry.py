from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class TelemetrySampleCreate(BaseModel):
    """Contrato de entrada de uma amostra de telemetria.

    O dispositivo pode ser identificado por ``serial_number`` (tópico MQTT
    ``sigma/{serial}/telemetry``) ou por ``device_id`` (referência do banco).
    """

    serial_number: str | None = Field(default=None, max_length=50)
    device_id: int | None = None

    temperature: float | None = None
    vibration_x: float | None = None
    vibration_y: float | None = None
    vibration_z: float | None = None
    rms: float | None = None
    peak: float | None = None
    crest_factor: float | None = None
    kurtosis: float | None = None
    recorded_at: datetime | None = None

    @model_validator(mode="after")
    def _requires_device(self):
        if self.serial_number is None and self.device_id is None:
            raise ValueError("Informe serial_number ou device_id")
        return self


class TelemetrySampleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    device_id: int
    temperature: float | None
    vibration_x: float | None
    vibration_y: float | None
    vibration_z: float | None
    rms: float | None
    peak: float | None
    crest_factor: float | None
    kurtosis: float | None
    recorded_at: datetime


class TelemetryIngestOk(BaseModel):
    device_id: int
    sample_id: int
    recorded_at: datetime
    accepted: bool = True
