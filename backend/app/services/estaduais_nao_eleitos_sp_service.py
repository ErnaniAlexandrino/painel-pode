from typing import List, Optional

from sqlalchemy.orm import Session

from ..db.repositories.estaduais_nao_eleitos_sp_repository import (
    EstaduaisNaoEleitosSPRepository,
)
from ..schemas.estaduais_nao_eleitos_sp import EstaduaisNaoEleitosSPRead


class EstaduaisNaoEleitosSPService:
    def __init__(self, db: Session) -> None:
        self.repository = EstaduaisNaoEleitosSPRepository(db)

    def list_estaduais_nao_eleitos_sp(
        self,
        nome_candidato: Optional[str] = None,
        partido: Optional[str] = None,
        situacao: Optional[str] = None,
        limit: int = 100,
    ) -> List[EstaduaisNaoEleitosSPRead]:
        registros = self.repository.list_all(
            nome_candidato=nome_candidato,
            partido=partido,
            situacao=situacao,
            limit=limit,
        )
        return [EstaduaisNaoEleitosSPRead.model_validate(registro) for registro in registros]

    def get_estaduais_nao_eleitos_sp(self, registro_id: int) -> EstaduaisNaoEleitosSPRead:
        registro = self.repository.get_by_id(registro_id)
        if not registro:
            raise ValueError("Registro não encontrado.")
        return EstaduaisNaoEleitosSPRead.model_validate(registro)

    def count_all(self) -> int:
        return self.repository.count_all()









