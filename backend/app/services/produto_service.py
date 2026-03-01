from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories import produto_repository
from app.schemas.produto import ProdutoCreate, ProdutoUpdate
from app.models.produto import Produto


def criar_produto(db: Session, data: ProdutoCreate) -> Produto:
    produto = produto_repository.create(db, data)
    db.commit()
    return produto


def listar_produtos(db: Session) -> list[Produto]:
    return produto_repository.get_all(db)


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
    produto_repository.delete(db, produto)
    db.commit()
