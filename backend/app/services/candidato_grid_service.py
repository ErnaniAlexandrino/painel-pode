from typing import List

from sqlalchemy.orm import Session

from ..db.repositories.candidato_grid_repository import CandidatoGridRepository
from ..schemas.candidato_grid import (
    CandidatoGridCreate,
    CandidatoGridRead,
    CandidatoGridUpdate,
)


class CandidatoGridService:
    def __init__(self, db: Session) -> None:
        self.repository = CandidatoGridRepository(db)

    def create_candidato(self, candidato_data: CandidatoGridCreate) -> CandidatoGridRead:
        candidato = self.repository.create(candidato_data.model_dump())
        return CandidatoGridRead.model_validate(candidato)

    def list_candidatos(self) -> List[CandidatoGridRead]:
        candidatos = self.repository.list_all()
        return [CandidatoGridRead.model_validate(candidato) for candidato in candidatos]

    def update_candidato(
        self, candidato_id: int, candidato_data: CandidatoGridUpdate
    ) -> CandidatoGridRead:
        if not candidato_data.model_fields_set:
            raise ValueError("Nenhuma informação foi enviada para atualização.")

        candidato = self.repository.update(
            candidato_id,
            candidato_data.model_dump(exclude_unset=True),
        )
        if not candidato:
            raise ValueError("Candidato não encontrado.")
        return CandidatoGridRead.model_validate(candidato)



