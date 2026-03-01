from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate, ProdutoUpdate


def get_all(db: Session, page: int = 1, size: int = 20) -> tuple[list[Produto], int]:
    offset = (page - 1) * size
    total = db.execute(select(func.count()).select_from(Produto)).scalar_one()
    items = db.execute(select(Produto).offset(offset).limit(size)).scalars().all()
    return list(items), total


def get_by_id(db: Session, produto_id: int) -> Produto | None:
    return db.execute(select(Produto).where(Produto.id == produto_id)).scalar_one_or_none()


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
