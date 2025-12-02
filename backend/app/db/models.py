from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, func

from .session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class CandidatoSP(Base):
    __tablename__ = "candidatos_sp"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uf = Column(String(50), nullable=False, index=True)
    candidato = Column(String(255), nullable=False, index=True)
    historico_de_votos = Column(Integer, nullable=True)
    cargo = Column(String(255), nullable=False, index=True)
    ano = Column(Integer, nullable=False, index=True)
    historico_de_fefc = Column(Integer, nullable=True)
    partido = Column(String(100), nullable=False, index=True)
    genero = Column(String(50), nullable=True, index=True)
    raca_cor = Column(String(100), nullable=True, index=True)
    situacao = Column(String(255), nullable=True, index=True)


class CandidatoGrid(Base):
    __tablename__ = "candidatos_grid"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    posicao_candidato = Column(Integer, nullable=False, index=True)
    vaga = Column(String(50), nullable=True)
    nome_urna = Column(String(255), nullable=False, index=True)
    voto_proj_max = Column(String(100), nullable=True)
    voto_proj_min = Column(String(100), nullable=True)
    historico_votos = Column(String(100), nullable=True)
    cargo_disputado = Column(String(255), nullable=True)
    ano = Column(String(10), nullable=True)
    fefc_projetado = Column(String(255), nullable=True)
    fefc_historico = Column(String(255), nullable=True)
    reduto = Column(String(255), nullable=True)
    partido = Column(String(100), nullable=True, index=True)
    genero = Column(String(50), nullable=True, index=True)
    raca = Column(String(100), nullable=True)
    status = Column(String(100), nullable=True, index=True)
    has_info = Column(Boolean, nullable=False, default=False)


class FederaisNaoEleitosSP(Base):
    __tablename__ = "federais_nao_eleitos_sp"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uf = Column(String(50), nullable=False, index=True)
    candidato = Column(String(255), nullable=False, index=True)
    historico_de_votos = Column(Integer, nullable=True)
    cargo = Column(String(255), nullable=False, index=True)
    historico_de_fefc = Column(Integer, nullable=True)
    partido = Column(String(100), nullable=False, index=True)
    genero = Column(String(50), nullable=True, index=True)
    situacao = Column(String(255), nullable=True, index=True)


class EstaduaisNaoEleitosSP(Base):
    __tablename__ = "estaduais_nao_eleitos_sp"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    uf = Column(String(50), nullable=False, index=True)
    candidato = Column(String(255), nullable=False, index=True)
    historico_de_votos = Column(Integer, nullable=True)
    cargo = Column(String(255), nullable=False, index=True)
    historico_de_fefc = Column(Integer, nullable=True)
    partido = Column(String(100), nullable=False, index=True)
    genero = Column(String(50), nullable=True, index=True)
    situacao = Column(String(255), nullable=True, index=True)


class CandidatosSP2224(Base):
    __tablename__ = "candidatos_sp_22_24"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sequencial_restultado = Column(String(50), nullable=True)
    sequencial_candidato = Column(String(50), nullable=True)
    sequencial_fundo = Column(String(50), nullable=True)
    ano = Column(Integer, nullable=True, index=True)
    titulo_eleitoral = Column(String(50), nullable=True)
    nome = Column(String(255), nullable=True, index=True)
    nome_urna = Column(String(255), nullable=True, index=True)
    raca = Column(String(50), nullable=True, index=True)
    genero = Column(String(50), nullable=True, index=True)
    cargo = Column(String(255), nullable=True, index=True)
    partido = Column(String(100), nullable=True, index=True)
    resultado = Column(String(100), nullable=True, index=True)
    resultado_agregado = Column(String(100), nullable=True, index=True)
    votos = Column(Integer, nullable=True)
    fundo_especial = Column(Float, nullable=True)
    fundo_partidario = Column(Float, nullable=True)
    fundo_total = Column(Float, nullable=True)
    ordem = Column(Integer, nullable=True)
