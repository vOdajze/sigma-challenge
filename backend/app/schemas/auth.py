from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator
import re
class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    identifier: str = Field(
        min_length=3,
        description="Username ou email"
    )
    password: str = Field(min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str | None
    created_at: datetime
class RegistroRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8)
    email: str | None = Field(default=None, max_length=255)

    @field_validator("password")
    @classmethod
    def validar_senha(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("A senha deve conter ao menos uma letra maiúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("A senha deve conter ao menos uma letra minúscula")
        if not re.search(r"\d", v):
            raise ValueError("A senha deve conter ao menos um número")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("A senha deve conter ao menos um caractere especial")
        return v

class RegistroResponse(BaseModel):
    msg: str
