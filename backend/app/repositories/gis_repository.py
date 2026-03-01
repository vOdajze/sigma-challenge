from sqlalchemy.orm import Session
from app.models.ponto_amostragem import PontoAmostragem


def create(db: Session, latitude: float, longitude: float, desc_uso_solo: str) -> PontoAmostragem:
    ponto = PontoAmostragem(latitude=latitude, longitude=longitude, desc_uso_solo=desc_uso_solo)
    db.add(ponto)
    db.flush()
    db.refresh(ponto)
    return ponto


def get_all(db: Session) -> list[PontoAmostragem]:
    return db.query(PontoAmostragem).order_by(PontoAmostragem.created_at.desc()).all()
