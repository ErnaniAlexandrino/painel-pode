from typing import Optional

from sqlalchemy.orm import Session

from ..models import EstaduaisNaoEleitosSP


class EstaduaisNaoEleitosSPRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(
        self,
        nome_candidato: Optional[str] = None,
        partido: Optional[str] = None,
        situacao: Optional[str] = None,
        limit: int = 100,
    ):
        query = self.db.query(EstaduaisNaoEleitosSP)

        if nome_candidato:
            query = query.filter(EstaduaisNaoEleitosSP.candidato.ilike(f"%{nome_candidato}%"))

        if partido:
            query = query.filter(EstaduaisNaoEleitosSP.partido.ilike(f"%{partido}%"))

        if situacao:
            query = query.filter(EstaduaisNaoEleitosSP.situacao.ilike(f"%{situacao}%"))

        return (
            query.order_by(EstaduaisNaoEleitosSP.historico_de_votos.desc())
            .limit(max(limit, 1))
            .all()
        )

    def get_by_id(self, registro_id: int):
        return (
            self.db.query(EstaduaisNaoEleitosSP)
            .filter(EstaduaisNaoEleitosSP.id == registro_id)
            .first()
        )

    def count_all(self):
        return self.db.query(EstaduaisNaoEleitosSP).count()








