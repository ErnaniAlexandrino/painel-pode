from typing import Optional

from pydantic import BaseModel, ConfigDict


class CandidatoFederalGridBase(BaseModel):
    vaga: Optional[str] = None
    nome_urna: str
    voto_proj_max: Optional[str] = None
    voto_proj_min: Optional[str] = None
    historico_votos: Optional[str] = None
    cargo_disputado: Optional[str] = None
    ano: Optional[str] = None
    fefc_projetado: Optional[str] = None
    fefc_historico: Optional[str] = None
    reduto: Optional[str] = None
    partido: Optional[str] = None
    genero: Optional[str] = None
    raca: Optional[str] = None
    status: Optional[str] = None
    has_info: bool = False
    posicao_candidato: int


class CandidatoFederalGridCreate(CandidatoFederalGridBase):
    pass


class CandidatoFederalGridRead(CandidatoFederalGridBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CandidatoFederalGridUpdate(BaseModel):
    vaga: Optional[str] = None
    nome_urna: Optional[str] = None
    voto_proj_max: Optional[str] = None
    voto_proj_min: Optional[str] = None
    historico_votos: Optional[str] = None
    cargo_disputado: Optional[str] = None
    ano: Optional[str] = None
    fefc_projetado: Optional[str] = None
    fefc_historico: Optional[str] = None
    reduto: Optional[str] = None
    partido: Optional[str] = None
    genero: Optional[str] = None
    raca: Optional[str] = None
    status: Optional[str] = None
    has_info: Optional[bool] = None
    posicao_candidato: Optional[int] = None


class CandidatoFederalGridUpdateOrder(BaseModel):
    id: int
    posicao_candidato: int

