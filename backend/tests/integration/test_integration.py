import pytest


def criar_produto_com_estoque(client, estoque: int = 0, preco: str = "10.00"):
    payload = {"nome": "Produto", "preco": preco, "quantidade_estoque": estoque}
    resp = client.post("/produtos", json=payload)
    assert resp.status_code == 201
    return resp.json()


def registrar_movimentacao(client, produto_id: int, quantidade: int, tipo: str):
    return client.post(
        "/caixa/movimentacao",
        json={"produto_id": produto_id, "quantidade": quantidade, "tipo_movimentacao": tipo},
    )



def test_registrar_entrada_cria_movimentacao(client):
    produto = criar_produto_com_estoque(client, estoque=0, preco="20.00")
    resp = registrar_movimentacao(client, produto["id"], 10, "entrada")

    assert resp.status_code == 201
    data = resp.json()
    assert data["quantidade"] == 10
    assert float(data["valor_unitario"]) == 20.0   
    assert float(data["valor_total"]) == 200.0    
    assert data["tipo_movimentacao"] == "entrada"


def test_entrada_usa_preco_do_produto_nao_do_payload(client):
    produto = criar_produto_com_estoque(client, estoque=0, preco="99.99")
    resp = registrar_movimentacao(client, produto["id"], 2, "entrada")

    assert resp.status_code == 201
    assert float(resp.json()["valor_unitario"]) == 99.99  


def test_saida_com_estoque_suficiente_retorna_201(client):
    produto = criar_produto_com_estoque(client, estoque=20, preco="5.00")
    resp = registrar_movimentacao(client, produto["id"], 10, "saida")

    assert resp.status_code == 201


def test_saida_com_estoque_insuficiente_retorna_400(client):
    produto = criar_produto_com_estoque(client, estoque=3, preco="5.00")
    resp = registrar_movimentacao(client, produto["id"], 10, "saida")

    assert resp.status_code == 400
    assert resp.json()["detail"] == "Estoque insuficiente"


def test_saida_com_estoque_zero_retorna_400(client):
    produto = criar_produto_com_estoque(client, estoque=0, preco="5.00")
    resp = registrar_movimentacao(client, produto["id"], 1, "saida")

    assert resp.status_code == 400


def test_movimentacao_produto_inexistente_retorna_404(client):
    resp = registrar_movimentacao(client, produto_id=9999, quantidade=1, tipo="entrada")
    assert resp.status_code == 404



def test_entrada_atualiza_quantidade_estoque(client):
    produto = criar_produto_com_estoque(client, estoque=0, preco="10.00")
    registrar_movimentacao(client, produto["id"], 15, "entrada")

    resp = client.get(f"/produtos/{produto['id']}")
    assert resp.json()["quantidade_estoque"] == 15


def test_saida_reduz_quantidade_estoque(client):
    produto = criar_produto_com_estoque(client, estoque=20, preco="10.00")
    registrar_movimentacao(client, produto["id"], 8, "saida")

    resp = client.get(f"/produtos/{produto['id']}")
    assert resp.json()["quantidade_estoque"] == 12


def test_multiplas_movimentacoes_atualizam_estoque_corretamente(client):
    produto = criar_produto_com_estoque(client, estoque=0, preco="10.00")
    pid = produto["id"]

    registrar_movimentacao(client, pid, 50, "entrada")
    registrar_movimentacao(client, pid, 20, "saida")
    registrar_movimentacao(client, pid, 10, "entrada")

    resp = client.get(f"/produtos/{pid}")
    assert resp.json()["quantidade_estoque"] == 40  




def test_listar_movimentacoes_retorna_estrutura_paginada(client):
    produto = criar_produto_com_estoque(client, estoque=100, preco="10.00")
    for _ in range(5):
        registrar_movimentacao(client, produto["id"], 1, "entrada")

    resp = client.get("/caixa/movimentacoes?page=1&size=3")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 5
    assert data["page"] == 1
    assert data["size"] == 3
    assert data["pages"] == 2
    assert len(data["items"]) == 3


def test_listar_movimentacoes_segunda_pagina(client):
    produto = criar_produto_com_estoque(client, estoque=100, preco="10.00")
    for _ in range(5):
        registrar_movimentacao(client, produto["id"], 1, "entrada")

    resp = client.get("/caixa/movimentacoes?page=2&size=3")
    assert len(resp.json()["items"]) == 2


def test_listar_movimentacoes_sem_registros(client):
    resp = client.get("/caixa/movimentacoes")
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []
    assert data["pages"] == 0



def test_criar_produto_com_estoque_inicial(client):
    payload = {"nome": "Produto X", "preco": "15.00", "quantidade_estoque": 100}
    resp = client.post("/produtos", json=payload)

    assert resp.status_code == 201
    assert resp.json()["quantidade_estoque"] == 100


def test_criar_produto_sem_estoque_inicial_usa_zero(client):
    payload = {"nome": "Produto Y", "preco": "10.00"}
    resp = client.post("/produtos", json=payload)

    assert resp.status_code == 201
    assert resp.json()["quantidade_estoque"] == 0


def test_listar_produtos_retorna_estrutura_paginada(client):
    for i in range(7):
        client.post("/produtos", json={"nome": f"Produto {i}", "preco": "1.00"})

    resp = client.get("/produtos?page=1&size=5")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 7
    assert data["pages"] == 2
    assert len(data["items"]) == 5


def test_listar_produtos_segunda_pagina(client):
    for i in range(7):
        client.post("/produtos", json={"nome": f"Produto {i}", "preco": "1.00"})

    resp = client.get("/produtos?page=2&size=5")
    assert len(resp.json()["items"]) == 2


def test_paginacao_size_invalido_retorna_422(client):
    resp = client.get("/produtos?size=0")
    assert resp.status_code == 422


def test_paginacao_page_invalida_retorna_422(client):
    resp = client.get("/produtos?page=0")
    assert resp.status_code == 422


def test_atualizar_produto_nao_altera_estoque_diretamente(client, produto_criado):
    pid = produto_criado["id"]
    resp = client.patch(f"/produtos/{pid}", json={"nome": "Novo Nome"})

    assert resp.status_code == 200
    assert "quantidade_estoque" in resp.json()
    assert resp.json()["quantidade_estoque"] == produto_criado["quantidade_estoque"]


def test_remover_produto_sem_movimentacoes_retorna_204(client):
    produto = client.post("/produtos", json={"nome": "Para Deletar", "preco": "5.00"}).json()

    resp = client.delete(f"/produtos/{produto['id']}")
    assert resp.status_code == 204


def test_remover_produto_com_movimentacoes_retorna_409(client):
    produto = client.post("/produtos", json={"nome": "Com Mov", "preco": "10.00"}).json()
    client.post(
        "/caixa/movimentacao",
        json={"produto_id": produto["id"], "quantidade": 1, "tipo_movimentacao": "entrada"},
    )

    resp = client.delete(f"/produtos/{produto['id']}")
    assert resp.status_code == 409
    assert "movimentações" in resp.json()["detail"]