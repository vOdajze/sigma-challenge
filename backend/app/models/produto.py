from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Text, Numeric, DateTime, CheckConstraint, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.movimentacao import MovimentacaoCaixa


class Produto(Base):
    __tablename__ = "produtos"
    __table_args__ = (
        CheckConstraint("preco >= 0", name="produtos_preco_check"),
        CheckConstraint("quantidade_estoque >= 0", name="produtos_quantidade_estoque_check"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(255))
    descricao: Mapped[str | None] = mapped_column(Text, nullable=True)
    preco: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    quantidade_estoque: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    movimentacoes: Mapped[list[MovimentacaoCaixa]] = relationship(
        "MovimentacaoCaixa",
        back_populates="produto",
        passive_deletes=True,
    )
