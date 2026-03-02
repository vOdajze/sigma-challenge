from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Annotated
from app.schemas.base import Money, PaginatedResponse


class ProdutoCreate(BaseModel):
    nome: str
    descricao: str | None = None  
    preco: Money = Field(gt=0)
    quantidade_estoque: int = Field(default=0, ge=0) 


class ProdutoUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid") 
    nome: str | None = None
    descricao: str | None = None
    preco: Annotated[Money | None, Field(gt=0)] = None

class ProdutoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    descricao: str | None
    preco: Money
    quantidade_estoque: int           
    created_at: datetime
    updated_at: datetime


ProdutoPaginatedResponse = PaginatedResponse[ProdutoResponse]
