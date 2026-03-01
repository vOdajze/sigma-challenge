from fastapi import APIRouter, Depends, Query, status, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.deps import get_current_user
from app.schemas.produto import ProdutoCreate, ProdutoUpdate, ProdutoResponse, ProdutoPaginatedResponse
from app.services import produto_service

router = APIRouter()

_404 = {404: {"description": "Produto não encontrado"}}
_409 = {409: {"description": "Produto possui movimentações e não pode ser removido"}}
_422 = {422: {"description": "Dados inválidos ou campos obrigatórios ausentes"}}


@router.post("", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED, responses={**_422})
def criar_produto(data: ProdutoCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return produto_service.criar_produto(db, data)


@router.get("", response_model=ProdutoPaginatedResponse)
def listar_produtos(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return produto_service.listar_produtos(db, page=page, size=size)


@router.get("/{produto_id}", response_model=ProdutoResponse, responses={**_404, **_422})
def buscar_produto(produto_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return produto_service.buscar_produto(db, produto_id)


@router.patch("/{produto_id}", response_model=ProdutoResponse, responses={**_404, **_422})
def atualizar_produto(
    produto_id: int,
    data: ProdutoUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return produto_service.atualizar_produto(db, produto_id, data)


@router.delete("/{produto_id}", status_code=status.HTTP_204_NO_CONTENT, responses={**_404, **_409})
def remover_produto(produto_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    produto_service.remover_produto(db, produto_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
