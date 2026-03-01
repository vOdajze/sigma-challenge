from __future__ import annotations
from decimal import Decimal
from typing import Annotated, Generic, TypeVar
from pydantic import PlainSerializer,BaseModel

T = TypeVar("T")

Money = Annotated[Decimal, PlainSerializer(lambda x: float(x), return_type=float)]

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int
    pages: int