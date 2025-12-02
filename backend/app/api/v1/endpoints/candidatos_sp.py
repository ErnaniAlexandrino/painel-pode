from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....schemas.candidato import CandidatoSPRead, CandidatoSPUpdate
from ....services.candidato_service import CandidatoService

router = APIRouter(tags=["candidatos"])


@router.get("/candidatos2022sp", response_model=List[CandidatoSPRead])
def listar_candidatos_sp(
    db: Session = Depends(get_db),
    nome_candidato: Optional[str] = Query(
        None,
        alias="nome_candidato",
        description="Filtro opcional pelo início do nome do candidato",
        min_length=1,
    ),
    q: Optional[str] = Query(
        None,
        alias="q",
        include_in_schema=False,
        min_length=1,
    ),
    limit: int = Query(
        10,
        ge=1,
        le=100,
        description="Número máximo de registros retornados",
    ),
) -> List[CandidatoSPRead]:
    filtro = nome_candidato or q
    service = CandidatoService(db)
    return service.list_candidatos_sp(nome_candidato=filtro, limit=limit)


@router.get(
    "/candidatos2022sp/{candidato_id}",
    response_model=CandidatoSPRead,
    status_code=status.HTTP_200_OK,
)
def obter_candidato_sp(candidato_id: int, db: Session = Depends(get_db)) -> CandidatoSPRead:
    service = CandidatoService(db)
    try:
        return service.get_candidato_sp(candidato_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put(
    "/candidatos2022sp/{candidato_id}",
    response_model=CandidatoSPRead,
    status_code=status.HTTP_200_OK,
)
def atualizar_candidato_sp(
    candidato_id: int, candidato_payload: CandidatoSPUpdate, db: Session = Depends(get_db)
) -> CandidatoSPRead:
    service = CandidatoService(db)
    try:
        return service.update_candidato_sp(candidato_id, candidato_payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST
            if "Nenhuma informação" in str(exc)
            else status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc




