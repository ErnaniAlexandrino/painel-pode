from typing import List, Optional

from sqlalchemy.orm import Session

from ..db.repositories.candidato_sp_repository import CandidatoSPRepository
from ..schemas.candidato import CandidatoSPRead, CandidatoSPUpdate


class CandidatoService:
    def __init__(self, db: Session) -> None:
        self.repository = CandidatoSPRepository(db)

    def list_candidatos_sp(
        self, nome_candidato: Optional[str] = None, limit: int = 10
    ) -> List[CandidatoSPRead]:
        candidatos = self.repository.list_all(nome_candidato=nome_candidato, limit=limit)
        return [CandidatoSPRead.model_validate(candidato) for candidato in candidatos]

    def get_candidato_sp(self, candidato_id: int) -> CandidatoSPRead:
        candidato = self.repository.get_by_id(candidato_id)
        if not candidato:
            raise ValueError("Candidato não encontrado.")
        return CandidatoSPRead.model_validate(candidato)

    def update_candidato_sp(
        self, candidato_id: int, candidato_payload: CandidatoSPUpdate
    ) -> CandidatoSPRead:
        if not candidato_payload.model_fields_set:
            raise ValueError("Nenhuma informação foi enviada para atualização.")

        candidato = self.repository.update(
            candidato_id,
            candidato_payload.model_dump(exclude_unset=True),
        )
        if not candidato:
            raise ValueError("Candidato não encontrado.")
        return CandidatoSPRead.model_validate(candidato)
