from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.dependencies.deps import get_current_user
from app.models.usuario import Usuario
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    RegistroRequest,
    RegistroResponse,
    UsuarioResponse,
)
from app.services import auth_service

router = APIRouter()

_401 = {401: {"description": "Credenciais inválidas"}}
_409 = {409: {"description": "Username ou email já em uso"}}
_422 = {422: {"description": "Dados inválidos ou campos obrigatórios ausentes"}}


@router.post("/login", response_model=TokenResponse, responses={**_401, **_422})
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    result = auth_service.login(db, data.identifier, data.password)

    response.set_cookie(
        key="access_token",
        value=result["access_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return result


@router.post("/logout", status_code=200)
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"msg": "Logout realizado com sucesso"}


@router.post(
    "/register",
    response_model=RegistroResponse,
    status_code=201,
    responses={**_409, **_422},
)
def registrar(data: RegistroRequest, db: Session = Depends(get_db)):
    return auth_service.registrar_usuario(db, data.username, data.password, data.email)


@router.get("/me", response_model=UsuarioResponse)
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user
