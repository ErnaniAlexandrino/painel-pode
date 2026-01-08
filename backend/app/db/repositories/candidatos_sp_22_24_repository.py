from typing import Optional, Dict, List

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
        cargo: Optional[str] = None,
        raca: Optional[str] = None,
        limit: int = 100,
    ):
        query = self.db.query(CandidatosSP2224)
        
        # Condições fixas: ordem = 1 e fundo_partidario is not null
        # query = query.filter(CandidatosSP2224.ordem == 1)
        query = query.filter(CandidatosSP2224.fundo_partidario.isnot(None))

        if nome:
            query = query.filter(CandidatosSP2224.nome_urna.ilike(f"%{nome}%"))

        if partido:
            query = query.filter(CandidatosSP2224.partido.ilike(f"%{partido}%"))

        if genero:
            query = query.filter(CandidatosSP2224.genero.ilike(f"%{genero}%"))

        if ano:
            query = query.filter(CandidatosSP2224.ano == ano)

        if resultado_agregado:
            query = query.filter(CandidatosSP2224.resultado_agregado == resultado_agregado)

        if cargo:
            query = query.filter(CandidatosSP2224.cargo.ilike(f"%{cargo}%"))

        if raca:
            query = query.filter(CandidatosSP2224.raca.ilike(f"%{raca}%"))

        return (
            query.order_by(CandidatosSP2224.ano.desc())
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

    def get_filter_options(self) -> Dict[str, List]:
        """
        Retorna valores distintos de cada campo de filtro diretamente da base de dados.
        Aplica o mesmo filtro de fundo_partidario IS NOT NULL para consistência.
        """
        base_query = self.db.query(CandidatosSP2224).filter(
            CandidatosSP2224.fundo_partidario.isnot(None)
        )
        
        # Obter valores distintos de cada campo
        anos = [
            str(ano[0]) for ano in 
            base_query.with_entities(CandidatosSP2224.ano)
            .filter(CandidatosSP2224.ano.isnot(None))
            .distinct()
            .order_by(CandidatosSP2224.ano)
            .all()
        ]
        
        cargos = [
            cargo[0] for cargo in
            base_query.with_entities(CandidatosSP2224.cargo)
            .filter(CandidatosSP2224.cargo.isnot(None))
            .distinct()
            .order_by(CandidatosSP2224.cargo)
            .all()
        ]
        
        partidos = [
            partido[0] for partido in
            base_query.with_entities(CandidatosSP2224.partido)
            .filter(CandidatosSP2224.partido.isnot(None))
            .distinct()
            .order_by(CandidatosSP2224.partido)
            .all()
        ]
        
        generos = [
            genero[0] for genero in
            base_query.with_entities(CandidatosSP2224.genero)
            .filter(CandidatosSP2224.genero.isnot(None))
            .distinct()
            .order_by(CandidatosSP2224.genero)
            .all()
        ]
        
        racas = [
            raca[0] for raca in
            base_query.with_entities(CandidatosSP2224.raca)
            .filter(CandidatosSP2224.raca.isnot(None))
            .distinct()
            .order_by(CandidatosSP2224.raca)
            .all()
        ]
        
        resultados = [
            resultado[0] for resultado in
            base_query.with_entities(CandidatosSP2224.resultado_agregado)
            .filter(CandidatosSP2224.resultado_agregado.isnot(None))
            .distinct()
            .order_by(CandidatosSP2224.resultado_agregado)
            .all()
        ]
        
        return {
            "ano": anos,
            "cargo": cargos,
            "partido": partidos,
            "genero": generos,
            "raca": racas,
            "resultado_agregado": resultados,
        }

