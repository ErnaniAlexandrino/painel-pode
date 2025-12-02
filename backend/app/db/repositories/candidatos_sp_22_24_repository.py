from typing import Optional

from sqlalchemy.orm import Session

from ..models import CandidatosSP2224


class CandidatosSP2224Repository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(
        self,
        nome: Optional[str] = None,
        partido: Optional[str] = None,
        genero: Optional[str] = None,
        ano: Optional[int] = None,
        resultado_agregado: Optional[str] = None,
        limit: int = 100,
    ):
        query = self.db.query(CandidatosSP2224)
        
        # Condições fixas: ordem = 1 e fundo_partidario is not null
        query = query.filter(CandidatosSP2224.ordem == 1)
        query = query.filter(CandidatosSP2224.fundo_partidario.isnot(None))

        if nome:
            query = query.filter(CandidatosSP2224.nome.ilike(f"%{nome}%"))

        if partido:
            query = query.filter(CandidatosSP2224.partido.ilike(f"%{partido}%"))

        if genero:
            query = query.filter(CandidatosSP2224.genero.ilike(f"%{genero}%"))

        if ano:
            query = query.filter(CandidatosSP2224.ano == ano)

        if resultado_agregado:
            query = query.filter(CandidatosSP2224.resultado_agregado.ilike(f"%{resultado_agregado}%"))

        return (
            query.order_by(CandidatosSP2224.votos.desc())
            .limit(max(limit, 1))
            .all()
        )

    def get_by_id(self, registro_id: int):
        return (
            self.db.query(CandidatosSP2224)
            .filter(CandidatosSP2224.id == registro_id)
            .first()
        )

    def count_all(self):
        return self.db.query(CandidatosSP2224).count()

