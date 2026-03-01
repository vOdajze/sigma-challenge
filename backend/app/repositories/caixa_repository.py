from decimal import Decimal
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.movimentacao import MovimentacaoCaixa
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


def get_all(db: Session, page: int = 1, size: int = 20) -> tuple[list[MovimentacaoCaixa], int]:
    offset = (page - 1) * size
    total = db.execute(select(func.count()).select_from(MovimentacaoCaixa)).scalar_one()
    items = (
        db.execute(
            select(MovimentacaoCaixa)
            .order_by(MovimentacaoCaixa.data_movimentacao.desc())
            .offset(offset)
            .limit(size)
        )
        .scalars()
        .all()
    )
    return list(items), total
