from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse, RegistroRequest, RegistroResponse
from app.services import auth_service


router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, data.username, data.password)


@router.post("/register", response_model=RegistroResponse, status_code=201)
def registrar(data: RegistroRequest, db: Session = Depends(get_db)):
    return auth_service.registrar_usuario(db, data.username, data.password)
