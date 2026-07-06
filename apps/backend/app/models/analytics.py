from sqlalchemy import DateTime, Float, ForeignKey, String, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Analytics(Base):
    __tablename__ = "analytics"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id"), nullable=False, index=True)
    metric: Mapped[str] = mapped_column(String(50), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    period_start: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    period_end: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index("ix_analytics_device_metric", "device_id", "metric"),
        Index("ix_analytics_created", "created_at"),
    )
