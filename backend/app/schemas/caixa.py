from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.models.movimentacao import TipoMovimentacao
from app.schemas.base import Money


class MovimentacaoCreate(BaseModel):
    produto_id: int
    quantidade: int = Field(gt=0)
    valor_unitario: Money = Field(gt=0)
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


class CaixaResumoResponse(BaseModel):
    total_entradas: float
    total_saidas: float
    saldo: float
    total: int
    movimentacoes: list[MovimentacaoResponse]
