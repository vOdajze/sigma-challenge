import pytest
from unittest.mock import MagicMock, patch
from decimal import Decimal
from fastapi import HTTPException
from app.services import caixa_service
from app.schemas.caixa import MovimentacaoCreate
from app.models.movimentacao import TipoMovimentacao


def make_produto(estoque: int = 10, preco: str = "50.00"):
    produto = MagicMock()
    produto.id = 1
    produto.quantidade_estoque = estoque
    produto.preco = Decimal(preco)
    return produto


def make_movimentacao(tipo: TipoMovimentacao, quantidade: int = 5):
    return MovimentacaoCreate(
        produto_id=1,
        quantidade=quantidade,
        tipo_movimentacao=tipo,
    )



def test_registrar_movimentacao_usa_preco_do_produto():
    db = MagicMock()
    produto = make_produto(estoque=10, preco="25.00")
    data = make_movimentacao(TipoMovimentacao.entrada, quantidade=3)

    with (
        patch("app.services.caixa_service.produto_repository.get_by_id", return_value=produto),
        patch("app.services.caixa_service.caixa_repository.create") as mock_create,
    ):
        mock_create.return_value = MagicMock()
        caixa_service.registrar_movimentacao(db, data)
        _, kwargs = mock_create.call_args
        assert kwargs["valor_unitario"] == Decimal("25.00")



def test_saida_com_estoque_suficiente_nao_levanta_excecao():
    db = MagicMock()
    produto = make_produto(estoque=10)
    data = make_movimentacao(TipoMovimentacao.saida, quantidade=5)

    with (
        patch("app.services.caixa_service.produto_repository.get_by_id", return_value=produto),
        patch("app.services.caixa_service.caixa_repository.create", return_value=MagicMock()),
    ):
        result = caixa_service.registrar_movimentacao(db, data)
        assert result is not None


def test_saida_com_estoque_insuficiente_retorna_400():
    db = MagicMock()
    produto = make_produto(estoque=3)
    data = make_movimentacao(TipoMovimentacao.saida, quantidade=5)

    with patch("app.services.caixa_service.produto_repository.get_by_id", return_value=produto):
        with pytest.raises(HTTPException) as exc:
            caixa_service.registrar_movimentacao(db, data)
        assert exc.value.status_code == 400
        assert exc.value.detail == "Estoque insuficiente"


def test_saida_com_estoque_exato_e_permitida():
    db = MagicMock()
    produto = make_produto(estoque=5)
    data = make_movimentacao(TipoMovimentacao.saida, quantidade=5)

    with (
        patch("app.services.caixa_service.produto_repository.get_by_id", return_value=produto),
        patch("app.services.caixa_service.caixa_repository.create", return_value=MagicMock()),
    ):
        result = caixa_service.registrar_movimentacao(db, data)
        assert result is not None


def test_saida_com_estoque_zero_retorna_400():
    db = MagicMock()
    produto = make_produto(estoque=0)
    data = make_movimentacao(TipoMovimentacao.saida, quantidade=1)

    with patch("app.services.caixa_service.produto_repository.get_by_id", return_value=produto):
        with pytest.raises(HTTPException) as exc:
            caixa_service.registrar_movimentacao(db, data)
        assert exc.value.status_code == 400



def test_entrada_incrementa_estoque():
    db = MagicMock()
    produto = make_produto(estoque=10)
    data = make_movimentacao(TipoMovimentacao.entrada, quantidade=5)

    with (
        patch("app.services.caixa_service.produto_repository.get_by_id", return_value=produto),
        patch("app.services.caixa_service.caixa_repository.create", return_value=MagicMock()),
    ):
        caixa_service.registrar_movimentacao(db, data)
        assert produto.quantidade_estoque == 15


def test_saida_decrementa_estoque():
    db = MagicMock()
    produto = make_produto(estoque=10)
    data = make_movimentacao(TipoMovimentacao.saida, quantidade=4)

    with (
        patch("app.services.caixa_service.produto_repository.get_by_id", return_value=produto),
        patch("app.services.caixa_service.caixa_repository.create", return_value=MagicMock()),
    ):
        caixa_service.registrar_movimentacao(db, data)
        assert produto.quantidade_estoque == 6



def test_produto_nao_encontrado_retorna_404():
    db = MagicMock()
    data = make_movimentacao(TipoMovimentacao.entrada)

    with patch("app.services.caixa_service.produto_repository.get_by_id", return_value=None):
        with pytest.raises(HTTPException) as exc:
            caixa_service.registrar_movimentacao(db, data)
        assert exc.value.status_code == 404
        assert exc.value.detail == "Produto não encontrado"