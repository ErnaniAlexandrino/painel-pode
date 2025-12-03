from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....schemas.estaduais_nao_eleitos_sp import EstaduaisNaoEleitosSPRead
from ....services.estaduais_nao_eleitos_sp_service import EstaduaisNaoEleitosSPService

router = APIRouter(tags=["estaduais-nao-eleitos-sp"])


@router.get("/estaduais-nao-eleitos-sp", response_model=List[EstaduaisNaoEleitosSPRead])
def listar_estaduais_nao_eleitos_sp(
    db: Session = Depends(get_db),
    nome_candidato: Optional[str] = Query(
        None,
        alias="nome_candidato",
        description="Filtro opcional pelo nome do candidato (busca parcial)",
        min_length=1,
    ),
    partido: Optional[str] = Query(
        None,
        alias="partido",
        description="Filtro opcional pelo partido (busca parcial)",
        min_length=1,
    ),
    situacao: Optional[str] = Query(
        None,
        alias="situacao",
        description="Filtro opcional pela situação",
        min_length=1,
    ),
    limit: int = Query(
        100,
        ge=1,
        le=500,
        description="Número máximo de registros retornados",
    ),
) -> List[EstaduaisNaoEleitosSPRead]:
    """
    Lista os deputados estaduais não eleitos de São Paulo.
    """
    service = EstaduaisNaoEleitosSPService(db)
    return service.list_estaduais_nao_eleitos_sp(
        nome_candidato=nome_candidato,
        partido=partido,
        situacao=situacao,
        limit=limit,
    )


@router.get(
    "/estaduais-nao-eleitos-sp/{registro_id}",
    response_model=EstaduaisNaoEleitosSPRead,
    status_code=status.HTTP_200_OK,
)
def obter_estaduais_nao_eleitos_sp(
    registro_id: int,
    db: Session = Depends(get_db),
) -> EstaduaisNaoEleitosSPRead:
    """
    Obtém um registro específico de deputado estadual não eleito por ID.
    """
    service = EstaduaisNaoEleitosSPService(db)
    try:
        return service.get_estaduais_nao_eleitos_sp(registro_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get(
    "/estaduais-nao-eleitos-sp/stats/count",
    status_code=status.HTTP_200_OK,
)
def contar_estaduais_nao_eleitos_sp(
    db: Session = Depends(get_db),
) -> dict:
    """
    Retorna a contagem total de registros na tabela.
    """
    service = EstaduaisNaoEleitosSPService(db)
    count = service.count_all()
    return {"total": count}









