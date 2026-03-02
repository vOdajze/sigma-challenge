from datetime import date
from decimal import Decimal
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.movimentacao import MovimentacaoCaixa, TipoMovimentacao
from app.schemas.caixa import MovimentacaoCreate


def create(db: Session, data: MovimentacaoCreate, valor_unitario: Decimal) -> MovimentacaoCaixa:
    movimentacao = MovimentacaoCaixa(
        **data.model_dump(),
        valor_unitario=valor_unitario,
    )
    db.add(movimentacao)
    db.flush()
    db.refresh(movimentacao)
    return movimentacao


def get_all(
    db: Session,
    page: int = 1,
    size: int = 20,
    tipo: TipoMovimentacao | None = None,
    produto_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
) -> tuple[list[MovimentacaoCaixa], int]:
    query = select(MovimentacaoCaixa)

    if tipo:
        query = query.where(MovimentacaoCaixa.tipo_movimentacao == tipo)
    if produto_id:
        query = query.where(MovimentacaoCaixa.produto_id == produto_id)
    if data_inicio:
        query = query.where(MovimentacaoCaixa.data_movimentacao >= data_inicio)
    if data_fim:
        query = query.where(MovimentacaoCaixa.data_movimentacao <= data_fim)

    query = query.order_by(MovimentacaoCaixa.data_movimentacao.desc())
    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
    items = db.execute(query.offset((page - 1) * size).limit(size)).scalars().all()
    return list(items), total