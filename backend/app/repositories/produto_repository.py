from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate, ProdutoUpdate


def get_all(
    db: Session,
    page: int = 1,
    size: int = 20,
    nome: str | None = None,
    preco_min: float | None = None,
    preco_max: float | None = None,
    estoque_min: int | None = None,
) -> tuple[list[Produto], int]:
    query = select(Produto)

    if nome:
        query = query.where(Produto.nome.ilike(f"%{nome}%"))
    if preco_min is not None:
        query = query.where(Produto.preco >= preco_min)
    if preco_max is not None:
        query = query.where(Produto.preco <= preco_max)
    if estoque_min is not None:
        query = query.where(Produto.quantidade_estoque >= estoque_min)

    total = db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
    items = db.execute(query.offset((page - 1) * size).limit(size)).scalars().all()
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
