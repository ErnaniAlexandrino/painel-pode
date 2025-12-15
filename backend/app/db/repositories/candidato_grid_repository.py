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

    def update_order(self, updates: List[Dict[str, int]], user_id: Optional[int] = None, estado: Optional[str] = None):
        try:
            for update in updates:
                query = self.db.query(CandidatoGrid).filter(CandidatoGrid.id == update["id"])
                
                # Garantir que só atualiza candidatos do mesmo user_id e estado
                if user_id is not None:
                    query = query.filter(CandidatoGrid.user_id == user_id)
                if estado is not None:
                    query = query.filter(CandidatoGrid.estado == estado)
                
                query.update({"posicao_candidato": update["posicao_candidato"]})
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e

    def list_all(self, user_id: Optional[int] = None, estado: Optional[str] = None) -> List[CandidatoGrid]:
        query = self.db.query(CandidatoGrid)
        
        if user_id is not None:
            query = query.filter(CandidatoGrid.user_id == user_id)
        
        if estado is not None:
            query = query.filter(CandidatoGrid.estado == estado)
        
        return query.order_by(CandidatoGrid.posicao_candidato.asc()).all()

    def get_by_id(self, candidato_id: int) -> Optional[CandidatoGrid]:
        return (
            self.db.query(CandidatoGrid)
            .filter(CandidatoGrid.id == candidato_id)
            .first()
        )

    def get_by_nome_urna(self, nome_urna: str, user_id: Optional[int] = None, estado: Optional[str] = None) -> Optional[CandidatoGrid]:
        query = self.db.query(CandidatoGrid).filter(CandidatoGrid.nome_urna == nome_urna)
        
        if user_id is not None:
            query = query.filter(CandidatoGrid.user_id == user_id)
        
        if estado is not None:
            query = query.filter(CandidatoGrid.estado == estado)
        
        return query.first()

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

    def delete(self, candidato_id: int, user_id: Optional[int] = None, estado: Optional[str] = None) -> None:
        candidato = self.get_by_id(candidato_id)
        if candidato:
            # Verificar se o candidato pertence ao user_id e estado especificados
            if user_id is not None and candidato.user_id != user_id:
                raise ValueError("Candidato não pertence ao usuário especificado.")
            if estado is not None and candidato.estado != estado:
                raise ValueError("Candidato não pertence ao estado especificado.")
            
            posicao_excluida = candidato.posicao_candidato
            user_id_candidato = candidato.user_id
            estado_candidato = candidato.estado
            
            self.db.delete(candidato)
            
            # Reindexar: decrementar posicao de todos com posicao maior do mesmo user_id e estado
            if posicao_excluida is not None:
                query = self.db.query(CandidatoGrid).filter(
                    CandidatoGrid.posicao_candidato > posicao_excluida,
                    CandidatoGrid.user_id == user_id_candidato,
                    CandidatoGrid.estado == estado_candidato
                )
                query.update(
                    {CandidatoGrid.posicao_candidato: CandidatoGrid.posicao_candidato - 1},
                    synchronize_session='fetch'
                )
            
            self.db.commit()

