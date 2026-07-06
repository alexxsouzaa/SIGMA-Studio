from uuid import uuid4

from sqlalchemy import Boolean, DateTime, String, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(
        String(32), default=lambda: uuid4().hex, nullable=False, unique=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    serial_number: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    firmware_version: Mapped[str] = mapped_column(String(20), nullable=False)
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_device_serial", "serial_number"),
        Index("ix_device_active", "active"),
        Index("ix_device_created_at", "created_at"),
    )
