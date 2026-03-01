from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.deps import get_current_user
from app.schemas.caixa import MovimentacaoCreate, MovimentacaoResponse, CaixaResumoResponse
from app.services import caixa_service

router = APIRouter()

_404 = {404: {"description": "Produto não encontrado"}}
_422 = {422: {"description": "Dados inválidos ou campos obrigatórios ausentes"}}


@router.post(
    "/movimentacao",
    response_model=MovimentacaoResponse,
    status_code=status.HTTP_201_CREATED,
    responses={**_404, **_422},
)
def registrar_movimentacao(
    data: MovimentacaoCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return caixa_service.registrar_movimentacao(db, data)


@router.get("", response_model=CaixaResumoResponse)
def resumo_caixa(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return caixa_service.resumo_caixa(db)
