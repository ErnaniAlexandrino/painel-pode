from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ....schemas.user import UserCreate, UserRead
from ....services.auth_service import AuthService
from ....db.session import get_db

router = APIRouter(tags=["users"])


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    service = AuthService(db)
    return service.register_user(user_in)
