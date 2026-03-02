from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.models.movimentacao import TipoMovimentacao
from app.schemas.base import Money, PaginatedResponse


class MovimentacaoCreate(BaseModel):
    produto_id: int
    quantidade: int = Field(gt=0)
    tipo_movimentacao: TipoMovimentacao


class MovimentacaoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    produto_id: int
    quantidade: int
    valor_unitario: Money
    valor_total: Money
    tipo_movimentacao: TipoMovimentacao
    data_movimentacao: datetime


class MovimentacaoListResponse(BaseModel):
    items: list[MovimentacaoResponse]
    total: int
    page: int
    size: int
    pages: int
    total_entradas: float
    total_saidas: float
    saldo: float


class CaixaResumoResponse(BaseModel):
    total_entradas: float
    total_saidas: float
    saldo: float
    total: int
    movimentacoes: list[MovimentacaoResponse]


MovimentacaoPaginatedResponse = PaginatedResponse[MovimentacaoResponse]
