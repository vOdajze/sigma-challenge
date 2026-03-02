from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories import usuario_repository
from app.core.security import verify_password, create_access_token
from app.core.config import settings


def login(db: Session, identifier: str, password: str) -> dict:
    usuario = usuario_repository.get_by_username(db, identifier)
    if not usuario:
        usuario = usuario_repository.get_by_email(db, identifier)

    if not usuario or not verify_password(password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": usuario.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }

def registrar_usuario(
    db: Session,
    username: str,
    password: str,
    email: str | None = None,
) -> dict:
    if usuario_repository.get_by_username(db, username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username já está em uso",
        )

    if email and usuario_repository.get_by_email(db, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já está em uso",
        )

    usuario_repository.create(db, username, password, email)
    db.commit()
    return {"msg": f"Usuário criado com sucesso"}
