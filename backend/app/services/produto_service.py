import math
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.repositories import produto_repository
from app.schemas.produto import ProdutoCreate, ProdutoUpdate, ProdutoPaginatedResponse
from app.models.produto import Produto


def criar_produto(db: Session, data: ProdutoCreate) -> Produto:
    produto = produto_repository.create(db, data)
    db.commit()
    return produto


def listar_produtos(
    db: Session,
    page: int,
    size: int,
    nome: str | None = None,
    preco_min: float | None = None,
    preco_max: float | None = None,
    estoque_min: int | None = None,
) -> ProdutoPaginatedResponse:
    items, total = produto_repository.get_all(
        db, page=page, size=size,
        nome=nome, preco_min=preco_min,
        preco_max=preco_max, estoque_min=estoque_min,
    )
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": math.ceil(total / size) if size else 0,
    }


def buscar_produto(db: Session, produto_id: int) -> Produto:
    produto = produto_repository.get_by_id(db, produto_id)
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    return produto


def atualizar_produto(db: Session, produto_id: int, data: ProdutoUpdate) -> Produto:
    produto = buscar_produto(db, produto_id)
    produto = produto_repository.update(db, produto, data)
    db.commit()
    return produto


def remover_produto(db: Session, produto_id: int) -> None:
    produto = buscar_produto(db, produto_id)
    try:
        produto_repository.delete(db, produto)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Produto possui movimentações e não pode ser removido",
        )
