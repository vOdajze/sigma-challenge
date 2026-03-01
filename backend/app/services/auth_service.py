from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories import usuario_repository
from app.core.security import verify_password, create_access_token
from app.core.config import settings


def login(db: Session, username: str, password: str) -> dict:
    usuario = usuario_repository.get_by_username(db, username)
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


def registrar_usuario(db: Session, username: str, password: str) -> dict:
    existente = usuario_repository.get_by_username(db, username)
    if existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username já está em uso",
        )
    usuario_repository.create(db, username, password)
    db.commit()
    return {"msg": f"Usuário '{username}' criado com sucesso"}
