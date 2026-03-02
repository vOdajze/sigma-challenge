from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.core.security import hash_password


def get_by_username(db: Session, username: str) -> Usuario | None:
    return db.execute(
        select(Usuario).where(Usuario.username == username)
    ).scalar_one_or_none()


def get_by_email(db: Session, email: str) -> Usuario | None:
    return db.execute(
        select(Usuario).where(Usuario.email == email)
    ).scalar_one_or_none()


def create(db: Session, username: str, password: str, email: str | None = None) -> Usuario:
    usuario = Usuario(
        username=username,
        hashed_password=hash_password(password),
        email=email,
    )
    db.add(usuario)
    db.flush()
    db.refresh(usuario)
    return usuario
