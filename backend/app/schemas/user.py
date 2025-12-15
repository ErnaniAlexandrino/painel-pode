from typing import Optional

from pydantic import BaseModel, EmailStr, Field, model_validator


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    perfil: Optional[str] = None  # Coordenador ou Gestor
    estados: Optional[str] = None  # Lista de estados separados por vírgula


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=72)
    confirm_password: str = Field(min_length=8, max_length=72)

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError('As senhas não coincidem')
        # Garantir que a senha seja uma string válida
        if not isinstance(self.password, str):
            raise ValueError('A senha deve ser uma string')
        return self


class UserRead(UserBase):
    id: int

    model_config = {
        "from_attributes": True,
    }


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
