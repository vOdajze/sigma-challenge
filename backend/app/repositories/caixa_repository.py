from datetime import date, datetime, time
from decimal import Decimal
from sqlalchemy import select, func, case
from sqlalchemy.orm import Session
from app.models.movimentacao import MovimentacaoCaixa, TipoMovimentacao
from app.schemas.caixa import MovimentacaoCreate


def _aplicar_filtros(query, tipo, produto_id, data_inicio, data_fim):
    if tipo:
        query = query.where(MovimentacaoCaixa.tipo_movimentacao == tipo)
    if produto_id:
        query = query.where(MovimentacaoCaixa.produto_id == produto_id)
    if data_inicio:
        query = query.where(
            MovimentacaoCaixa.data_movimentacao >= datetime.combine(data_inicio, time.min)
        )
    if data_fim:
        query = query.where(
            MovimentacaoCaixa.data_movimentacao <= datetime.combine(data_fim, time.max)
        )
    return query


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
    query = _aplicar_filtros(query, tipo, produto_id, data_inicio, data_fim)
    query = query.order_by(MovimentacaoCaixa.data_movimentacao.desc())

    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
    items = db.execute(query.offset((page - 1) * size).limit(size)).scalars().all()
    return list(items), total


def get_totais(
    db: Session,
    tipo: TipoMovimentacao | None = None,
    produto_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
) -> dict:
    query = select(
        func.coalesce(func.sum(
            case(
                (MovimentacaoCaixa.tipo_movimentacao == TipoMovimentacao.entrada,
                 MovimentacaoCaixa.valor_total),
                else_=0,
            )
        ), 0).label("total_entradas"),
        func.coalesce(func.sum(
            case(
                (MovimentacaoCaixa.tipo_movimentacao == TipoMovimentacao.saida,
                 MovimentacaoCaixa.valor_total),
                else_=0,
            )
        ), 0).label("total_saidas"),
    ).select_from(MovimentacaoCaixa)

    query = _aplicar_filtros(query, tipo, produto_id, data_inicio, data_fim)
    row = db.execute(query).one()
    total_entradas = float(row.total_entradas)
    total_saidas = float(row.total_saidas)
    return {
        "total_entradas": total_entradas,
        "total_saidas": total_saidas,
        "saldo": total_entradas - total_saidas,
    }
