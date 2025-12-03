from typing import Optional

from pydantic import BaseModel


class EstaduaisNaoEleitosSPBase(BaseModel):
    uf: str
    candidato: str
    historico_de_votos: Optional[int] = None
    cargo: str
    historico_de_fefc: Optional[int] = None
    partido: str
    genero: Optional[str] = None
    situacao: Optional[str] = None


class EstaduaisNaoEleitosSPRead(EstaduaisNaoEleitosSPBase):
    id: int

    model_config = {
        "from_attributes": True,
    }









