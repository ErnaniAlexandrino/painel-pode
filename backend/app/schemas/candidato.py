from typing import Optional

from pydantic import BaseModel


class CandidatoSPBase(BaseModel):
    uf: str
    candidato: str
    historico_de_votos: Optional[int] = None
    cargo: str
    ano: int
    historico_de_fefc: Optional[int] = None
    partido: str
    genero: Optional[str] = None
    raca_cor: Optional[str] = None
    situacao: Optional[str] = None


class CandidatoSPRead(CandidatoSPBase):
    id: int

    model_config = {
        "from_attributes": True,
    }


class CandidatoSPUpdate(BaseModel):
    uf: Optional[str] = None
    candidato: Optional[str] = None
    historico_de_votos: Optional[int] = None
    cargo: Optional[str] = None
    ano: Optional[int] = None
    historico_de_fefc: Optional[int] = None
    partido: Optional[str] = None
    genero: Optional[str] = None
    raca_cor: Optional[str] = None
    situacao: Optional[str] = None
