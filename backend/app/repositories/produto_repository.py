from sqlalchemy.orm import Session
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate, ProdutoUpdate


def get_all(db: Session) -> list[Produto]:
    return db.query(Produto).all()


def get_by_id(db: Session, produto_id: int) -> Produto | None:
    return db.query(Produto).filter(Produto.id == produto_id).first()


def create(db: Session, data: ProdutoCreate) -> Produto:
    produto = Produto(**data.model_dump())
    db.add(produto)
    db.flush()
    db.refresh(produto)
    return produto


def update(db: Session, produto: Produto, data: ProdutoUpdate) -> Produto:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(produto, field, value)
    db.flush()
    db.refresh(produto)
    return produto


def delete(db: Session, produto: Produto) -> None:
    db.delete(produto)
    db.flush()
