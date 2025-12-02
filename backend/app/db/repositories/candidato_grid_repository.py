from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from ..models import CandidatoGrid


class CandidatoGridRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, candidato_data: dict) -> CandidatoGrid:
        candidato = CandidatoGrid(**candidato_data)
        self.db.add(candidato)
        self.db.commit()
        self.db.refresh(candidato)
        return candidato

    def list_all(self) -> List[CandidatoGrid]:
        return (
            self.db.query(CandidatoGrid)
            .order_by(CandidatoGrid.posicao_candidato.asc())
            .all()
        )

    def get_by_id(self, candidato_id: int) -> Optional[CandidatoGrid]:
        return (
            self.db.query(CandidatoGrid)
            .filter(CandidatoGrid.id == candidato_id)
            .first()
        )

    def update(self, candidato_id: int, candidato_data: Dict) -> Optional[CandidatoGrid]:
        candidato = self.get_by_id(candidato_id)
        if not candidato:
            return None

        for field, value in candidato_data.items():
            setattr(candidato, field, value)

        self.db.add(candidato)
        self.db.commit()
        self.db.refresh(candidato)
        return candidato

