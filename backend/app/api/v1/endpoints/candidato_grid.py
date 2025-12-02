from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....schemas.candidato_grid import (
    CandidatoGridCreate,
    CandidatoGridRead,
    CandidatoGridUpdate,
)
from ....services.candidato_grid_service import CandidatoGridService

router = APIRouter(tags=["candidatos-grid"])


@router.post(
    "/candidato/cadastrar",
    response_model=CandidatoGridRead,
    status_code=status.HTTP_201_CREATED,
)
def cadastrar_candidato(
    payload: CandidatoGridCreate, db: Session = Depends(get_db)
) -> CandidatoGridRead:
    service = CandidatoGridService(db)
    return service.create_candidato(payload)


@router.put(
    "/candidato/{candidato_id}",
    response_model=CandidatoGridRead,
    status_code=status.HTTP_200_OK,
)
def atualizar_candidato(
    candidato_id: int, payload: CandidatoGridUpdate, db: Session = Depends(get_db)
) -> CandidatoGridRead:
    service = CandidatoGridService(db)
    try:
        return service.update_candidato(candidato_id, payload)
    except ValueError as exc:
        status_code = (
            status.HTTP_400_BAD_REQUEST
            if "Nenhuma informação" in str(exc)
            else status.HTTP_404_NOT_FOUND
        )
        raise HTTPException(status_code=status_code, detail=str(exc)) from exc


@router.get("/candidatos", response_model=List[CandidatoGridRead])
def listar_candidatos(db: Session = Depends(get_db)) -> List[CandidatoGridRead]:
    service = CandidatoGridService(db)
    return service.list_candidatos()



