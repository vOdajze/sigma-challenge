from datetime import date
import math
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories import caixa_repository, produto_repository
from app.schemas.caixa import MovimentacaoCreate, MovimentacaoListResponse
from app.models.movimentacao import MovimentacaoCaixa, TipoMovimentacao


def registrar_movimentacao(db: Session, data: MovimentacaoCreate) -> MovimentacaoCaixa:
    produto = produto_repository.get_by_id(db, data.produto_id)
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")

    if data.tipo_movimentacao == TipoMovimentacao.saida:
        if produto.quantidade_estoque < data.quantidade:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Estoque insuficiente",
            )

    with db.begin_nested():
        if data.tipo_movimentacao == TipoMovimentacao.entrada:
            produto.quantidade_estoque += data.quantidade
        else:
            produto.quantidade_estoque -= data.quantidade

        movimentacao = caixa_repository.create(db, data, valor_unitario=produto.preco)

    db.commit()
    db.refresh(movimentacao)
    return movimentacao


def listar_movimentacoes(
    db: Session,
    page: int,
    size: int,
    tipo: TipoMovimentacao | None = None,
    produto_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
) -> MovimentacaoListResponse:
    filtros = dict(tipo=tipo, produto_id=produto_id, data_inicio=data_inicio, data_fim=data_fim)

    items, total = caixa_repository.get_all(db, page=page, size=size, **filtros)
    totais = caixa_repository.get_totais(db, **filtros)  

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": math.ceil(total / size) if size else 0,
        **totais,
    }
