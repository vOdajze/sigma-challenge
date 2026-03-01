from functools import lru_cache
from pathlib import Path
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
import geopandas as gpd
from shapely.geometry import Point

from app.core.config import settings
from app.models.ponto_amostragem import PontoAmostragem
from app.repositories import gis_repository
from app.schemas.gis import PontoCreate

GEOJSON_PATH = Path(settings.GEOJSON_PATH)


@lru_cache(maxsize=1)
def _carregar_geodataframe() -> gpd.GeoDataFrame:
    if not GEOJSON_PATH.exists():
        raise FileNotFoundError(f"GeoJSON não encontrado em: {GEOJSON_PATH}")
    return gpd.read_file(GEOJSON_PATH)


def listar_usos_solo() -> list[str]:
    gdf = _carregar_geodataframe()
    return sorted(gdf["desc_uso_solo"].dropna().unique().tolist())


def area_por_uso(uso: str) -> dict:
    gdf = _carregar_geodataframe()
    filtrado = gdf[gdf["desc_uso_solo"] == uso]
    if filtrado.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Uso do solo '{uso}' não encontrado no dataset",
        )
    filtrado_proj = filtrado.to_crs(epsg=31983)
    area_m2 = float(filtrado_proj.geometry.area.sum())
    return {
        "desc_uso_solo": uso,
        "area_m2": round(area_m2, 2),
        "area_km2": round(area_m2 / 1_000_000, 6),
    }


def identificar_uso_solo(latitude: float, longitude: float) -> str | None:
    gdf = _carregar_geodataframe()
    ponto = Point(longitude, latitude)
    for _, row in gdf.iterrows():
        if row.geometry and row.geometry.contains(ponto):
            return row["desc_uso_solo"]
    return None


def criar_ponto(db: Session, data: PontoCreate) -> PontoAmostragem:
    desc_uso_solo = identificar_uso_solo(data.latitude, data.longitude)
    if desc_uso_solo is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Coordenadas fora de qualquer geometria do dataset",
        )
    ponto = gis_repository.create(db, data.latitude, data.longitude, desc_uso_solo)
    db.commit()
    return ponto


def listar_pontos(db: Session) -> dict:
    pontos = gis_repository.get_all(db)
    return {"total": len(pontos), "pontos": pontos}
