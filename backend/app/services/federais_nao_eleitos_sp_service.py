from typing import List, Optional

from sqlalchemy.orm import Session

from ..db.repositories.federais_nao_eleitos_sp_repository import FederaisNaoEleitosSPRepository
from ..schemas.federais_nao_eleitos_sp import FederaisNaoEleitosSPRead


class FederaisNaoEleitosSPService:
    def __init__(self, db: Session) -> None:
        self.repository = FederaisNaoEleitosSPRepository(db)

    def list_federais_nao_eleitos_sp(
        self, 
        nome_candidato: Optional[str] = None,
        partido: Optional[str] = None,
        situacao: Optional[str] = None,
        limit: int = 100
    ) -> List[FederaisNaoEleitosSPRead]:
        registros = self.repository.list_all(
            nome_candidato=nome_candidato,
            partido=partido,
            situacao=situacao,
            limit=limit
        )
        return [FederaisNaoEleitosSPRead.model_validate(registro) for registro in registros]

    def get_federais_nao_eleitos_sp(self, registro_id: int) -> FederaisNaoEleitosSPRead:
        registro = self.repository.get_by_id(registro_id)
        if not registro:
            raise ValueError("Registro não encontrado.")
        return FederaisNaoEleitosSPRead.model_validate(registro)

    def count_all(self) -> int:
        return self.repository.count_all()









