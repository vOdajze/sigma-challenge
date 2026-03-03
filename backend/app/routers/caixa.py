from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.deps import get_current_user
from app.schemas.caixa import (
    MovimentacaoCreate,
    MovimentacaoListResponse,
    MovimentacaoResponse,
)
from app.services import caixa_service
from datetime import date
from app.models.movimentacao import TipoMovimentacao

router = APIRouter()

_400 = {400: {"description": "Estoque insuficiente"}}
_404 = {404: {"description": "Produto não encontrado"}}
_422 = {422: {"description": "Dados inválidos ou campos obrigatórios ausentes"}}


@router.post(
    "/movimentacao",
    response_model=MovimentacaoResponse,
    status_code=status.HTTP_201_CREATED,
    responses={**_400, **_404, **_422},
)
def registrar_movimentacao(
    data: MovimentacaoCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return caixa_service.registrar_movimentacao(db, data)


@router.get("/movimentacoes", response_model=MovimentacaoListResponse) 
def listar_movimentacoes(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    tipo: TipoMovimentacao | None = Query(default=None),
    produto_id: int | None = Query(default=None),
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return caixa_service.listar_movimentacoes(
        db, page=page, size=size,
        tipo=tipo, produto_id=produto_id,
        data_inicio=data_inicio, data_fim=data_fim,
    )