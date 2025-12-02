from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....schemas.candidatos_sp_22_24 import CandidatosSP2224Read
from ....services.candidatos_sp_22_24_service import CandidatosSP2224Service

router = APIRouter(tags=["candidatos-sp-22-24"])


@router.get("/candidatos-sp-22-24", response_model=List[CandidatosSP2224Read])
def listar_candidatos_sp_22_24(
    db: Session = Depends(get_db),
    nome: Optional[str] = Query(
        None,
        alias="nome",
        description="Filtro opcional pelo nome do candidato (busca parcial)",
        min_length=1,
    ),
    partido: Optional[str] = Query(
        None,
        alias="partido",
        description="Filtro opcional pelo partido (busca parcial)",
        min_length=1,
    ),
    genero: Optional[str] = Query(
        None,
        alias="genero",
        description="Filtro opcional pelo gênero",
        min_length=1,
    ),
    ano: Optional[int] = Query(
        None,
        alias="ano",
        description="Filtro opcional pelo ano da eleição (2022 ou 2024)",
    ),
    resultado_agregado: Optional[str] = Query(
        None,
        alias="resultado_agregado",
        description="Filtro opcional pelo resultado agregado (eleito, não eleito)",
        min_length=1,
    ),
    limit: int = Query(
        100,
        ge=1,
        le=1000,
        description="Número máximo de registros retornados",
    ),
) -> List[CandidatosSP2224Read]:
    """
    Lista os candidatos de SP das eleições de 2022 e 2024.
    """
    service = CandidatosSP2224Service(db)
    return service.list_candidatos(
        nome=nome,
        partido=partido,
        genero=genero,
        ano=ano,
        resultado_agregado=resultado_agregado,
        limit=limit,
    )


@router.get(
    "/candidatos-sp-22-24/stats/count",
    status_code=status.HTTP_200_OK,
)
def contar_candidatos_sp_22_24(
    db: Session = Depends(get_db),
) -> dict:
    """
    Retorna a contagem total de registros na tabela.
    """
    service = CandidatosSP2224Service(db)
    count = service.count_all()
    return {"total": count}


@router.get(
    "/candidatos-sp-22-24/{registro_id}",
    response_model=CandidatosSP2224Read,
    status_code=status.HTTP_200_OK,
)
def obter_candidato_sp_22_24(
    registro_id: int,
    db: Session = Depends(get_db),
) -> CandidatosSP2224Read:
    """
    Obtém um registro específico de candidato por ID.
    """
    service = CandidatosSP2224Service(db)
    try:
        return service.get_candidato(registro_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

