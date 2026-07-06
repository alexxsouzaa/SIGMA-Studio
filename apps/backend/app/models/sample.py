from sqlalchemy import Float, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Sample(Base):
    __tablename__ = "samples"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id"), nullable=False, index=True)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    vibration_x: Mapped[float | None] = mapped_column(Float, nullable=True)
    vibration_y: Mapped[float | None] = mapped_column(Float, nullable=True)
    vibration_z: Mapped[float | None] = mapped_column(Float, nullable=True)
    rms: Mapped[float | None] = mapped_column(Float, nullable=True)
    peak: Mapped[float | None] = mapped_column(Float, nullable=True)
    kurtosis: Mapped[float | None] = mapped_column(Float, nullable=True)
    crest_factor: Mapped[float | None] = mapped_column(Float, nullable=True)
    recorded_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    __table_args__ = (
        Index("ix_sample_device_recorded", "device_id", "recorded_at"),
    )
