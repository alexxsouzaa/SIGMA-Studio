from pydantic import BaseModel


class ProtocolSummary(BaseModel):
    name: str
    device_count: int
    gateway_count: int
    pct: float


class GatewaySummary(BaseModel):
    name: str
    protocol: str
    status: str


class AiInsightResponse(BaseModel):
    name: str
    type: str
    status: str
    accuracy: float
    description: str | None


class DashboardSummary(BaseModel):
    total_devices: int
    active_devices: int
    inactive_devices: int
    total_alerts: int
    active_alerts: int
    critical_alerts: int
    messages_per_minute: int
