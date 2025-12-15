from typing import List

from sqlalchemy.orm import Session

from ..db.repositories.candidato_grid_repository import CandidatoGridRepository
from ..schemas.candidato_grid import (
    CandidatoGridCreate,
    CandidatoGridRead,
    CandidatoGridUpdate,
    CandidatoGridUpdateOrder,
)


class CandidatoGridService:
    def __init__(self, db: Session) -> None:
        self.repository = CandidatoGridRepository(db)

    def create_candidato(self, candidato_data: CandidatoGridCreate, user_id: int, estado: str) -> CandidatoGridRead:
        # Verificar se já existe candidato com mesmo nome_urna para este user_id e estado
        existente = self.repository.get_by_nome_urna(candidato_data.nome_urna, user_id=user_id, estado=estado)
        if existente:
            raise ValueError(f"Candidato '{candidato_data.nome_urna}' já está cadastrado para este estado.")

        candidato_dict = candidato_data.model_dump()
        candidato_dict['user_id'] = user_id
        candidato_dict['estado'] = estado
        
        candidato = self.repository.create(candidato_dict)
        return CandidatoGridRead.model_validate(candidato)

    def list_candidatos(self, user_id: int, estado: str) -> List[CandidatoGridRead]:
        candidatos = self.repository.list_all(user_id=user_id, estado=estado)
        return [CandidatoGridRead.model_validate(candidato) for candidato in candidatos]

    def update_candidato(
        self, candidato_id: int, candidato_data: CandidatoGridUpdate, user_id: int, estado: str
    ) -> CandidatoGridRead:
        if not candidato_data.model_fields_set:
            raise ValueError("Nenhuma informação foi enviada para atualização.")

        # Verificar se o candidato pertence ao usuário e estado
        candidato = self.repository.get_by_id(candidato_id)
        if not candidato:
            raise ValueError("Candidato não encontrado.")
        if candidato.user_id != user_id:
            raise ValueError("Candidato não pertence ao usuário especificado.")
        if candidato.estado != estado:
            raise ValueError("Candidato não pertence ao estado especificado.")

        candidato = self.repository.update(
            candidato_id,
            candidato_data.model_dump(exclude_unset=True),
        )
        return CandidatoGridRead.model_validate(candidato)

    def update_order(self, updates: List[CandidatoGridUpdateOrder], user_id: int, estado: str) -> None:
        update_data = [u.model_dump() for u in updates]
        self.repository.update_order(update_data, user_id=user_id, estado=estado)

    def delete_candidato(self, candidato_id: int, user_id: int, estado: str) -> None:
        candidato = self.repository.get_by_id(candidato_id)
        if not candidato:
            raise ValueError("Candidato não encontrado.")
        self.repository.delete(candidato_id, user_id=user_id, estado=estado)


