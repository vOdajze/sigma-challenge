from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Annotated
from app.schemas.base import Money


class ProdutoCreate(BaseModel):
    nome: str
    descricao: str
    preco: Money = Field(gt=0)


class ProdutoUpdate(BaseModel):
    nome: str | None = None
    descricao: str | None = None
    preco: Annotated[Money | None, Field(gt=0)] = None


class ProdutoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    descricao: str
    preco: Money
    created_at: datetime
    updated_at: datetime
