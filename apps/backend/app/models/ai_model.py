from uuid import uuid4
from datetime import datetime

from sqlalchemy import String, DateTime, Float, Integer, Text, Boolean, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class AIModel(Base):
    __tablename__ = "ai_models"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(
        String(32), default=lambda: uuid4().hex, nullable=False, unique=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False, default="anomaly")
    framework: Mapped[str] = mapped_column(String(50), nullable=False, default="TinyML")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="staging")
    accuracy: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    latency: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    f1: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    device: Mapped[str | None] = mapped_column(String(100), nullable=True)
    size: Mapped[str | None] = mapped_column(String(20), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_ai_model_status", "status"),
    )
