from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ....core.dependencies import get_current_user_id, get_token_payload
from ....db.session import get_db
from ....schemas.candidato_federal_grid import (
    CandidatoFederalGridCreate,
    CandidatoFederalGridRead,
    CandidatoFederalGridUpdate,
    CandidatoFederalGridUpdateOrder,
)
from ....services.candidato_federal_grid_service import CandidatoFederalGridService

router = APIRouter(tags=["candidatos-federais-grid"])


@router.post(
    "/candidato-federal/cadastrar",
    response_model=CandidatoFederalGridRead,
    status_code=status.HTTP_201_CREATED,
)
def cadastrar_candidato_federal(
    payload: CandidatoFederalGridCreate,
    estado: str = Query(..., description="Estado do candidato"),
    user_id: int = Depends(get_current_user_id),
    token_payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> CandidatoFederalGridRead:
    # Validar se o estado pertence ao usuário
    estados_str = token_payload.get("estados", "")
    estados_permitidos = [e.strip() for e in estados_str.split(",") if e.strip()] if estados_str else []
    if estado.upper() not in [e.upper() for e in estados_permitidos]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para cadastrar candidatos neste estado",
        )
    
    service = CandidatoFederalGridService(db)
    try:
        return service.create_candidato(payload, user_id=user_id, estado=estado.upper())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put(
    "/candidato-federal/{candidato_id}",
    response_model=CandidatoFederalGridRead,
    status_code=status.HTTP_200_OK,
)
def atualizar_candidato_federal(
    candidato_id: int,
    payload: CandidatoFederalGridUpdate,
    estado: str = Query(..., description="Estado do candidato"),
    user_id: int = Depends(get_current_user_id),
    token_payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> CandidatoFederalGridRead:
    # Validar se o estado pertence ao usuário
    estados_str = token_payload.get("estados", "")
    estados_permitidos = [e.strip() for e in estados_str.split(",") if e.strip()] if estados_str else []
    if estado.upper() not in [e.upper() for e in estados_permitidos]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para atualizar candidatos neste estado",
        )
    
    service = CandidatoFederalGridService(db)
    try:
        return service.update_candidato(candidato_id, payload, user_id=user_id, estado=estado.upper())
    except ValueError as exc:
        status_code = (
            status.HTTP_400_BAD_REQUEST
            if "Nenhuma informação" in str(exc)
            else status.HTTP_404_NOT_FOUND
        )
        raise HTTPException(status_code=status_code, detail=str(exc)) from exc


@router.get("/candidatos-federais", response_model=List[CandidatoFederalGridRead])
def listar_candidatos_federais(
    estado: str = Query(..., description="Estado dos candidatos"),
    user_id: int = Depends(get_current_user_id),
    token_payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
) -> List[CandidatoFederalGridRead]:
    # Validar se o estado pertence ao usuário
    estados_str = token_payload.get("estados", "")
    estados_permitidos = [e.strip() for e in estados_str.split(",") if e.strip()] if estados_str else []
    if estado.upper() not in [e.upper() for e in estados_permitidos]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para visualizar candidatos deste estado",
        )
    
    service = CandidatoFederalGridService(db)
    return service.list_candidatos(user_id=user_id, estado=estado.upper())


@router.put("/candidatos-federais/update-order", status_code=status.HTTP_200_OK)
def update_order_federais(
    payload: List[CandidatoFederalGridUpdateOrder],
    estado: str = Query(..., description="Estado dos candidatos"),
    user_id: int = Depends(get_current_user_id),
    token_payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
):
    # Validar se o estado pertence ao usuário
    estados_str = token_payload.get("estados", "")
    estados_permitidos = [e.strip() for e in estados_str.split(",") if e.strip()] if estados_str else []
    if estado.upper() not in [e.upper() for e in estados_permitidos]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para atualizar a ordem dos candidatos neste estado",
        )
    
    service = CandidatoFederalGridService(db)
    try:
        service.update_order(payload, user_id=user_id, estado=estado.upper())
        return {"message": "Ordem dos candidatos atualizada com sucesso"}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar a ordem dos candidatos",
        ) from exc


@router.delete(
    "/candidato-federal/{candidato_id}",
    status_code=status.HTTP_200_OK,
)
def deletar_candidato_federal(
    candidato_id: int,
    estado: str = Query(..., description="Estado do candidato"),
    user_id: int = Depends(get_current_user_id),
    token_payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
):
    # Validar se o estado pertence ao usuário
    estados_str = token_payload.get("estados", "")
    estados_permitidos = [e.strip() for e in estados_str.split(",") if e.strip()] if estados_str else []
    if estado.upper() not in [e.upper() for e in estados_permitidos]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para excluir candidatos deste estado",
        )
    
    service = CandidatoFederalGridService(db)
    try:
        service.delete_candidato(candidato_id, user_id=user_id, estado=estado.upper())
        return {"message": "Candidato excluído com sucesso"}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
