from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ....db.session import get_db
from ....schemas.federais_nao_eleitos_sp import FederaisNaoEleitosSPRead
from ....services.federais_nao_eleitos_sp_service import FederaisNaoEleitosSPService

router = APIRouter(tags=["federais-nao-eleitos-sp"])


@router.get("/federais-nao-eleitos-sp", response_model=List[FederaisNaoEleitosSPRead])
def listar_federais_nao_eleitos_sp(
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
        description="Filtro opcional pela situação (NÃO ELEITO, SUPLENTE)",
        min_length=1,
    ),
    limit: int = Query(
        100,
        ge=1,
        le=500,
        description="Número máximo de registros retornados",
    ),
) -> List[FederaisNaoEleitosSPRead]:
    """
    Lista os deputados federais não eleitos de São Paulo em 2022.
    
    Retorna os top 40 candidatos que não foram eleitos ou são suplentes,
    ordenados por histórico de votos (maior para menor).
    """
    service = FederaisNaoEleitosSPService(db)
    return service.list_federais_nao_eleitos_sp(
        nome_candidato=nome_candidato,
        partido=partido,
        situacao=situacao,
        limit=limit
    )


@router.get(
    "/federais-nao-eleitos-sp/{registro_id}",
    response_model=FederaisNaoEleitosSPRead,
    status_code=status.HTTP_200_OK,
)
def obter_federais_nao_eleitos_sp(
    registro_id: int, 
    db: Session = Depends(get_db)
) -> FederaisNaoEleitosSPRead:
    """
    Obtém um registro específico de deputado federal não eleito por ID.
    """
    service = FederaisNaoEleitosSPService(db)
    try:
        return service.get_federais_nao_eleitos_sp(registro_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get(
    "/federais-nao-eleitos-sp/stats/count",
    status_code=status.HTTP_200_OK,
)
def contar_federais_nao_eleitos_sp(
    db: Session = Depends(get_db)
) -> dict:
    """
    Retorna a contagem total de registros na tabela.
    """
    service = FederaisNaoEleitosSPService(db)
    count = service.count_all()
    return {"total": count}









