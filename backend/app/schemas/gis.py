from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
import uuid


class PontoCreate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class PontoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    latitude: float
    longitude: float
    desc_uso_solo: str
    created_at: datetime


class UsoSoloArea(BaseModel):
    desc_uso_solo: str
    area_m2: float
    area_km2: float
    
class PontoListResponse(BaseModel):
    total: int
    pontos: list[PontoResponse]