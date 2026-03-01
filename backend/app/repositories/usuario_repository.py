from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.core.security import hash_password


def get_by_username(db: Session, username: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.username == username).first()


def create(db: Session, username: str, password: str) -> Usuario:
    usuario = Usuario(username=username, hashed_password=hash_password(password))
    db.add(usuario)
    db.flush()
    db.refresh(usuario)
    return usuario
