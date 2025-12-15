from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import bcrypt
from jose import jwt

from .config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha corresponde ao hash"""
    password_bytes = plain_password.encode('utf-8')
    # Bcrypt tem limite de 72 bytes
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Gera hash da senha usando bcrypt"""
    # Bcrypt tem limite de 72 bytes, então precisamos garantir que a senha não seja muito longa
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Gera o salt e faz o hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def create_access_token(
    subject: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = subject.copy()
    expire_delta = expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    expire = datetime.utcnow() + expire_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodifica um token JWT e retorna o payload"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except jwt.JWTError:
        raise ValueError("Token inválido")
