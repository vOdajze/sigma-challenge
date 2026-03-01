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

export interface PontoResponse {
  id: string;
  latitude: number;
  longitude: number;
  desc_uso_solo: string;
  created_at: string;
}

export interface PontoListResponse {
  total: number;
  pontos: PontoResponse[];
}

export interface UsoSoloArea {
  desc_uso_solo: string;
  area_m2: number;
  area_km2: number;
}
