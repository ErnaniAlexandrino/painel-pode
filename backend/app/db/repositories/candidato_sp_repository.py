from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from ..models import CandidatoSP


class CandidatoSPRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self, nome_candidato=None, limit: int = 10):
        query = self.db.query(CandidatoSP)
        if nome_candidato:
            query = query.filter(CandidatoSP.candidato.ilike(f"%{nome_candidato}%"))
        return (
            query.order_by(CandidatoSP.candidato)
            .limit(max(limit, 1))
            .all()
        )

    def get_by_id(self, candidato_id: int):
        return self.db.query(CandidatoSP).filter(CandidatoSP.id == candidato_id).first()

    def update(self, candidato_id: int, data: Dict[str, Any]) -> Optional[CandidatoSP]:
        candidato = self.get_by_id(candidato_id)
        if not candidato:
            return None

        for field, value in data.items():
            setattr(candidato, field, value)

        self.db.add(candidato)
        self.db.commit()
        self.db.refresh(candidato)
        return candidato
