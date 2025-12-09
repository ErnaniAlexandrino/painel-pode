from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....schemas.candidato_grid import (
    CandidatoGridCreate,
    CandidatoGridRead,
    CandidatoGridUpdate,
    CandidatoGridUpdateOrder,
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
    try:
        return service.create_candidato(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


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


@router.put("/candidatos/update-order", status_code=status.HTTP_200_OK)
def update_order(
    payload: List[CandidatoGridUpdateOrder], db: Session = Depends(get_db)
):
    service = CandidatoGridService(db)
    try:
        service.update_order(payload)
        return {"message": "Ordem dos candidatos atualizada com sucesso"}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar a ordem dos candidatos",
        ) from exc

