from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories import caixa_repository, produto_repository
from app.schemas.caixa import MovimentacaoCreate
from app.models.movimentacao import MovimentacaoCaixa, TipoMovimentacao


def registrar_movimentacao(db: Session, data: MovimentacaoCreate) -> MovimentacaoCaixa:
    produto = produto_repository.get_by_id(db, data.produto_id)
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")

    movimentacao = caixa_repository.create(db, data)
    db.commit()
    return movimentacao


def resumo_caixa(db: Session) -> dict:
    movimentacoes = caixa_repository.get_all(db)

    total_entradas = sum(
        float(m.valor_total) for m in movimentacoes if m.tipo_movimentacao == TipoMovimentacao.entrada
    )
    total_saidas = sum(
        float(m.valor_total) for m in movimentacoes if m.tipo_movimentacao == TipoMovimentacao.saida
    )

    return {
        "total_entradas": total_entradas,
        "total_saidas": total_saidas,
        "saldo": total_entradas - total_saidas,
        "total": len(movimentacoes),
        "movimentacoes": movimentacoes,
    }
