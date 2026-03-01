from sqlalchemy.orm import Session
from app.models.movimentacao import MovimentacaoCaixa
from app.schemas.caixa import MovimentacaoCreate


def create(db: Session, data: MovimentacaoCreate) -> MovimentacaoCaixa:
    movimentacao = MovimentacaoCaixa(**data.model_dump())
    db.add(movimentacao)
    db.flush()
    db.refresh(movimentacao)
    return movimentacao


def get_all(db: Session) -> list[MovimentacaoCaixa]:
    return (
        db.query(MovimentacaoCaixa)
        .order_by(MovimentacaoCaixa.data_movimentacao.desc())
        .all()
    )
