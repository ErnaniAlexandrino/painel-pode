from typing import Optional

from pydantic import BaseModel


class CandidatosSP2224Base(BaseModel):
    sequencial_restultado: Optional[str] = None
    sequencial_candidato: Optional[str] = None
    sequencial_fundo: Optional[str] = None
    ano: Optional[int] = None
    titulo_eleitoral: Optional[str] = None
    nome: Optional[str] = None
    nome_urna: Optional[str] = None
    raca: Optional[str] = None
    genero: Optional[str] = None
    cargo: Optional[str] = None
    partido: Optional[str] = None
    resultado: Optional[str] = None
    resultado_agregado: Optional[str] = None
    votos: Optional[int] = None
    fundo_especial: Optional[float] = None
    fundo_partidario: Optional[float] = None
    fundo_total: Optional[float] = None
    ordem: Optional[int] = None


class CandidatosSP2224Read(CandidatosSP2224Base):
    id: int

    model_config = {
        "from_attributes": True,
    }

