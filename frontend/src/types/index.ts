export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  created_at: string;
  updated_at: string;
}

export interface ProdutoCreate {
  nome: string;
  descricao: string;
  preco: number;
}

export interface Movimentacao {
  id: number;
  produto_id: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  tipo_movimentacao: "entrada" | "saida";
  data_movimentacao: string;
}

export interface MovimentacaoCreate {
  produto_id: number;
  quantidade: number;
  valor_unitario: number;
  tipo_movimentacao: "entrada" | "saida";
}

export interface CaixaResumo {
  total_entradas: number;
  total_saidas: number;
  saldo: number;
}
