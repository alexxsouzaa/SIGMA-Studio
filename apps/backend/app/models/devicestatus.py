from sqlalchemy import DateTime, Float, ForeignKey, String, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class DeviceStatus(Base):
    __tablename__ = "device_status"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    rssi: Mapped[float | None] = mapped_column(Float, nullable=True)
    uptime: Mapped[float | None] = mapped_column(Float, nullable=True)
    firmware_version: Mapped[str | None] = mapped_column(String(20), nullable=True)
    last_seen: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("ix_devicestatus_device", "device_id", "status"),
    )
