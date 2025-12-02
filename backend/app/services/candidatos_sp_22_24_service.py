from typing import List, Optional

from sqlalchemy.orm import Session

from ..db.repositories.candidatos_sp_22_24_repository import CandidatosSP2224Repository
from ..schemas.candidatos_sp_22_24 import CandidatosSP2224Read


class CandidatosSP2224Service:
    def __init__(self, db: Session) -> None:
        self.repository = CandidatosSP2224Repository(db)

    def list_candidatos(
        self,
        nome: Optional[str] = None,
        partido: Optional[str] = None,
        genero: Optional[str] = None,
        ano: Optional[int] = None,
        resultado_agregado: Optional[str] = None,
        limit: int = 100,
    ) -> List[CandidatosSP2224Read]:
        registros = self.repository.list_all(
            nome=nome,
            partido=partido,
            genero=genero,
            ano=ano,
            resultado_agregado=resultado_agregado,
            limit=limit,
        )
        return [CandidatosSP2224Read.model_validate(registro) for registro in registros]

    def get_candidato(self, registro_id: int) -> CandidatosSP2224Read:
        registro = self.repository.get_by_id(registro_id)
        if not registro:
            raise ValueError("Registro não encontrado.")
        return CandidatosSP2224Read.model_validate(registro)

    def count_all(self) -> int:
        return self.repository.count_all()

