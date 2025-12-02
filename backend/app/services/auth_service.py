from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.security import create_access_token, get_password_hash, verify_password
from ..db.repositories.user_repository import UserRepository
from ..schemas.user import LoginRequest, Token, UserCreate, UserRead


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repository = UserRepository(db)

    def register_user(self, user_in: UserCreate) -> UserRead:
        existing_user = self.repository.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="E-mail já registrado.",
            )

        hashed_password = get_password_hash(user_in.password)
        user = self.repository.create(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
        )
        return UserRead.model_validate(user)

    def authenticate(self, credentials: LoginRequest) -> Token:
        user = self.repository.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas.",
            )

        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
        token = create_access_token(
            subject={"sub": str(user.id), "email": user.email},
            expires_delta=expires_delta,
        )

        return Token(access_token=token, token_type="bearer")
