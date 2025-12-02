from fastapi import APIRouter

from .endpoints import (
    auth,
    candidatos_sp,
    candidatos_sp_22_24,
    estaduais_nao_eleitos_sp,
    federais_nao_eleitos_sp,
    users,
)

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(auth.router)
api_router.include_router(candidatos_sp.router)
api_router.include_router(candidatos_sp_22_24.router)
api_router.include_router(federais_nao_eleitos_sp.router)
api_router.include_router(estaduais_nao_eleitos_sp.router)
