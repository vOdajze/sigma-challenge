import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.usuario import Usuario
from app.models.produto import Produto
from app.models.movimentacao import MovimentacaoCaixa, TipoMovimentacao
from decimal import Decimal


def seed(db: Session) -> None:
    if not db.query(Usuario).first():
        usuarios = [
            Usuario(
                username="admin",
                hashed_password=hash_password("Admin@123"),
                email="admin@sigma.com",
            )
        ]
        db.add_all(usuarios)
        db.flush()
        print("Usuários criados pelo seed")

    if not db.query(Produto).first():
        produtos = [
            Produto(nome="Tomografia do Canavial", descricao="Monitoramento via Satélite (Pacote 10.000 ha)", preco=Decimal("15000.00"), quantidade_estoque=0),
            Produto(nome="Monitoramento de Produção Agrícola", descricao="Acompanhamento de safra contínuo", preco=Decimal("25000.00"), quantidade_estoque=0),
            
            Produto(nome="Valuation Agrícola - Crédito", descricao="Laudo para finalidade de crédito bancário", preco=Decimal("35000.00"), quantidade_estoque=0),
            Produto(nome="Valuation Agrícola - Fusões", descricao="Avaliação de Usinas para Fusões e Aquisições (M&A)", preco=Decimal("85000.00"), quantidade_estoque=0),
            
            Produto(nome="Relatório de Monitoramento - Cana", descricao="Produção Centro-Sul via Satélite", preco=Decimal("12000.00"), quantidade_estoque=0),
            Produto(nome="Dashboard Trading Analytics", descricao="Acesso à plataforma de dados Centro-Sul", preco=Decimal("8000.00"), quantidade_estoque=0),
            
            Produto(nome="Mapeamento de Grãos via Satélite", descricao="Análise de Soja/Milho (Pacote 5.000 ha)", preco=Decimal("9500.00"), quantidade_estoque=0),
            Produto(nome="Mapeamento de Eucalipto via Satélite", descricao="Inventário florestal e monitoramento", preco=Decimal("11000.00"), quantidade_estoque=0),
            
            Produto(nome="Estudo Ambiental Completo", descricao="EIA/RIMA para propriedades rurais", preco=Decimal("45000.00"), quantidade_estoque=0),
            Produto(nome="Due Diligence Ambiental", descricao="Auditoria de passivos ambientais", preco=Decimal("28000.00"), quantidade_estoque=0),
            Produto(nome="Consultoria RenovaBio", descricao="Assessoria completa para emissão de CBIOs", preco=Decimal("55000.00"), quantidade_estoque=0),
            Produto(nome="Consultoria Certificação Bonsucro", descricao="Adequação aos padrões internacionais", preco=Decimal("60000.00"), quantidade_estoque=0),
            
            Produto(nome="Avaliação de Imóvel Rural", descricao="Laudo completo para investidores", preco=Decimal("22000.00"), quantidade_estoque=0),
            Produto(nome="Análise de Ativo Biológico", descricao="Mensuração de valor justo do canavial", preco=Decimal("30000.00"), quantidade_estoque=0),
            
            Produto(nome="Projeto de Sustentabilidade B2B", descricao="Plano de descarbonização e monitoramento", preco=Decimal("120000.00"), quantidade_estoque=0),
        ]
        db.add_all(produtos)
        db.flush() 
        print("15 Produtos/Serviços criados pelo seed")

        movimentacoes = []
        
        for produto in produtos:
            movimentacoes.append(
                MovimentacaoCaixa(produto_id=produto.id, quantidade=10, valor_unitario=produto.preco, tipo_movimentacao=TipoMovimentacao.entrada)
            )
        
        saidas = [
            (0, 3),  # 3 Tomografias vendidas
            (2, 5),  # 5 Valuations para crédito vendidos
            (3, 1),  # 1 Valuation para M&A
            (4, 8),  # 8 Relatórios de Trading
            (10, 2), # 2 Consultorias RenovaBio
            (12, 4), # 4 Avaliações de Imóveis Rurais
            (14, 1)  # 1 Projeto para Multinacional
        ]

        for index_produto, qtd_vendida in saidas:
            produto = produtos[index_produto]
            movimentacoes.append(
                MovimentacaoCaixa(produto_id=produto.id, quantidade=qtd_vendida, valor_unitario=produto.preco, tipo_movimentacao=TipoMovimentacao.saida)
            )

        db.add_all(movimentacoes)
        db.flush()
        print("Movimentações de caixa criadas")

        estoques_calculados = {p.id: 0 for p in produtos}
        
        for mov in movimentacoes:
            if mov.tipo_movimentacao == TipoMovimentacao.entrada:
                estoques_calculados[mov.produto_id] += mov.quantidade
            elif mov.tipo_movimentacao == TipoMovimentacao.saida:
                estoques_calculados[mov.produto_id] -= mov.quantidade
        
        for produto in produtos:
            produto.quantidade_estoque = estoques_calculados[produto.id]

        print("Saldos de estoque atualizados dinamicamente")

    db.commit()
    print("Seed concluído com sucesso!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed(db)
    except Exception as e:
        db.rollback()
        print(f"Erro no seed: {e}")
        raise
    finally:
        db.close()