from __future__ import annotations
from typing import TYPE_CHECKING
import enum
from decimal import Decimal
from datetime import datetime
from sqlalchemy import Numeric, DateTime, ForeignKey, Enum, Integer, func, Computed, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.produto import Produto


class TipoMovimentacao(str, enum.Enum):
    entrada = "entrada"
    saida = "saida"


class MovimentacaoCaixa(Base):
    __tablename__ = "movimentacoes_caixa"
    __table_args__ = (
        CheckConstraint("quantidade > 0", name="movimentacoes_caixa_quantidade_check"),
        CheckConstraint("valor_unitario >= 0", name="movimentacoes_caixa_valor_unitario_check"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    produto_id: Mapped[int] = mapped_column(ForeignKey("produtos.id", ondelete="RESTRICT"), index=True)
    quantidade: Mapped[int] = mapped_column(Integer)
    valor_unitario: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    valor_total: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        Computed("quantidade * valor_unitario", persisted=True),
    )
    tipo_movimentacao: Mapped[TipoMovimentacao] = mapped_column(
        Enum(TipoMovimentacao, name="tipo_movimentacao_enum"),
        index=True,
    )
    data_movimentacao: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    produto: Mapped[Produto] = relationship("Produto", back_populates="movimentacoes")
