from uuid import uuid4
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(
        String(32), default=lambda: uuid4().hex, nullable=False, unique=True
    )
    site_id: Mapped[int] = mapped_column(
        ForeignKey("sites.id"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        Index("ix_project_site", "site_id"),
        Index("ix_project_active", "active"),
    )
