from sqlalchemy import DateTime, ForeignKey, String, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id"), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    occurred_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("ix_event_device_occurred", "device_id", "occurred_at"),
        Index("ix_event_type", "event_type"),
    )
