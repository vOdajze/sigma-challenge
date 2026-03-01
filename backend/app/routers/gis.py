from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.deps import get_current_user
from app.schemas.gis import PontoCreate, PontoListResponse, PontoResponse, UsoSoloArea
from app.services import gis_service

router = APIRouter()


@router.get("/usos-solo", response_model=list[str])
def listar_usos_solo(_=Depends(get_current_user)):
    return gis_service.listar_usos_solo()


@router.get("/usos-solo/{uso}", response_model=UsoSoloArea)
def area_por_uso(uso: str, _=Depends(get_current_user)):
    return gis_service.area_por_uso(uso)


@router.post("/pontos", response_model=PontoResponse, status_code=status.HTTP_201_CREATED)
def criar_ponto(
    data: PontoCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return gis_service.criar_ponto(db, data)


@router.get("/pontos", response_model=PontoListResponse)
def listar_pontos(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return gis_service.listar_pontos(db)