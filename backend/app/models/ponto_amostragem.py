from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, func, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class PontoAmostragem(Base):
    __tablename__ = "pontos_amostragem"
    __table_args__ = (
        CheckConstraint("latitude BETWEEN -90 AND 90", name="pontos_amostragem_latitude_check"),
        CheckConstraint("longitude BETWEEN -180 AND 180", name="pontos_amostragem_longitude_check"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    desc_uso_solo: Mapped[str] = mapped_column(String(255), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
