from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .security import decode_access_token

security = HTTPBearer()


def get_token_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Extrai o payload do token JWT"""
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        return payload
    except (ValueError, KeyError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        ) from exc


def get_current_user_id(
    payload: dict = Depends(get_token_payload)
) -> int:
    """Extrai o user_id do token JWT"""
    try:
        user_id = int(payload.get("sub"))
        return user_id
    except (ValueError, KeyError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: user_id não encontrado",
        ) from exc


def get_current_user_estados(
    payload: dict = Depends(get_token_payload)
) -> list[str]:
    """Extrai a lista de estados do token JWT"""
    try:
        estados_str = payload.get("estados", "")
        if not estados_str:
            return []
        return [e.strip() for e in estados_str.split(",") if e.strip()]
    except (ValueError, KeyError, TypeError):
        return []

