from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....schemas.user import LoginRequest, Token
from ....services.auth_service import AuthService
from ....db.session import get_db

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=Token)
def login(credentials: LoginRequest, db: Session = Depends(get_db)) -> Token:
    service = AuthService(db)
    return service.authenticate(credentials)
