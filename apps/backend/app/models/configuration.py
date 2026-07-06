from sqlalchemy import DateTime, ForeignKey, String, Text, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Configuration(Base):
    __tablename__ = "configurations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(ForeignKey("devices.id"), nullable=False, index=True)
    key: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_config_device_key", "device_id", "key", unique=True),
    )
