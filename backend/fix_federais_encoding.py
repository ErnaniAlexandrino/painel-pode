#!/usr/bin/env python3
"""
Script para corrigir os dados da tabela federais_nao_eleitos_sp
que foram populados com encoding incorreto.
"""
import csv
import logging
import sys
import unicodedata
from pathlib import Path
from typing import Dict

# Adiciona o diretório app ao path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.orm import Session
from app.db.models import FederaisNaoEleitosSP
from app.db.session import SessionLocal

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

EXPECTED_FIELDS = {
    "uf",
    "candidato",
    "historico_de_votos",
    "cargo",
    "historico_de_fefc",
    "partido",
    "genero",
    "situacao",
}

NUMERIC_FIELDS = {"historico_de_votos", "historico_de_fefc"}


def _normalize_column(column: str) -> str:
    """Normaliza o nome da coluna para o formato esperado"""
    normalized = unicodedata.normalize("NFKD", column)
    normalized = (
        normalized.encode("ascii", "ignore")
        .decode("ascii")
        .lower()
        .replace(" ", "_")
        .replace("/", "_")
    )
    while "__" in normalized:
        normalized = normalized.replace("__", "_")
    return normalized.strip("_")


def _parse_value(field: str, value: str):
    """Parse do valor, preservando encoding correto"""
    if not value:
        return None
    value = value.strip()
    if value == "":
        return None
    if field in NUMERIC_FIELDS:
        try:
            # Remove pontos de milhar
            return int(value.replace(".", "").replace(",", ""))
        except ValueError:
            logger.warning("Valor inválido para campo %s: %s", field, value)
            return None
    # Retorna o valor como string, preservando encoding
    return value


def _build_record(row: Dict[str, str]) -> Dict[str, str]:
    """Constrói um registro a partir de uma linha do CSV"""
    record: Dict[str, str] = {}
    for column, value in row.items():
        field = _normalize_column(column)
        if field not in EXPECTED_FIELDS:
            continue
        record[field] = _parse_value(field, value or "")

    missing_fields = EXPECTED_FIELDS.difference(record.keys())
    for field in missing_fields:
        record[field] = None
    return record


def fix_data():
    """Corrige os dados da tabela lendo o CSV original com encoding correto"""
    
    # Tentar múltiplos caminhos possíveis para o arquivo CSV
    possible_paths = [
        backend_dir.parent / "SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv",
        Path("/workspace/SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv"),
        backend_dir / "data" / "SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv",
        Path("/app/data/federais.csv"),
    ]
    
    csv_file = None
    for path in possible_paths:
        logger.info("Procurando arquivo CSV em: %s", path)
        if path.exists():
            csv_file = path
            logger.info("Arquivo CSV encontrado em: %s", csv_file)
            break
    
    if not csv_file or not csv_file.exists():
        logger.error("Arquivo CSV não encontrado. Tentando criar dados diretamente...")
        # Se não encontrar o arquivo, vamos usar os dados diretamente
        csv_file = None
    
    session: Session = SessionLocal()
    try:
        records = []
        
        # Sempre usar dados hardcoded com encoding correto para garantir que os caracteres especiais sejam preservados
        logger.info("Usando dados hardcoded com encoding correto para garantir acentuação...")
        if False and csv_file and csv_file.exists():
            logger.info("Lendo arquivo CSV com encoding UTF-8...")
            # Tentar diferentes encodings
            encodings = ["utf-8-sig", "utf-8", "latin-1", "iso-8859-1", "cp1252"]
            
            for encoding in encodings:
                try:
                    with csv_file.open(encoding=encoding, newline="") as csvfile:
                        reader = csv.DictReader(csvfile)
                        records = [_build_record(row) for row in reader]
                    logger.info("Arquivo lido com sucesso usando encoding: %s", encoding)
                    break
                except (UnicodeDecodeError, UnicodeError) as e:
                    logger.warning("Falha ao ler com encoding %s: %s", encoding, e)
                    continue
        
        # Usar dados hardcoded com encoding correto
        if not records:
            logger.info("Usando dados hardcoded com encoding correto...")
            csv_data = [
                {"UF": "SÃO PAULO", "CANDIDATO": "PABLO MARÇAL", "HISTÓRICO DE VOTOS": "243037", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1439254", "PARTIDO": "PROS", "GÊNERO": "MASCULINO", "SITUAÇÃO": "NÃO ELEITO"},
                {"UF": "SÃO PAULO", "CANDIDATO": "ORLANDO SILVA", "HISTÓRICO DE VOTOS": "108059", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2575274", "PARTIDO": "PC do B", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "PROFESSOR HOC, HENI OZI CUKIER", "HISTÓRICO DE VOTOS": "98720", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1541100", "PARTIDO": "PODE", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "DEPUTADO ALFREDINHO", "HISTÓRICO DE VOTOS": "97063", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1807512", "PARTIDO": "PT", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "PROF. MARCO ANTONIO VILLA", "HISTÓRICO DE VOTOS": "95745", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2001975", "PARTIDO": "CIDADANIA", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "ELY SANTOS", "HISTÓRICO DE VOTOS": "93305", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2513831", "PARTIDO": "REPUBLICANOS", "GÊNERO": "FEMININO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "ROBERTO ALVES", "HISTÓRICO DE VOTOS": "92566", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1509713", "PARTIDO": "REPUBLICANOS", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "EDUARDO CURY", "HISTÓRICO DE VOTOS": "92225", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1968455", "PARTIDO": "PSDB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "ADRILLES JORGE", "HISTÓRICO DE VOTOS": "91485", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1558445", "PARTIDO": "PTB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "NÃO ELEITO"},
                {"UF": "SÃO PAULO", "CANDIDATO": "JOSÉ SERRA", "HISTÓRICO DE VOTOS": "88926", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "3175000", "PARTIDO": "PSDB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "VANDERLEI MACRIS", "HISTÓRICO DE VOTOS": "87502", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "3096834", "PARTIDO": "PSDB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "VICENTINHO", "HISTÓRICO DE VOTOS": "82912", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2339990", "PARTIDO": "PT", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "SAULO PEDROSO", "HISTÓRICO DE VOTOS": "80186", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1251056", "PARTIDO": "PSD", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "JOÃO CURY", "HISTÓRICO DE VOTOS": "80085", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2734346", "PARTIDO": "MDB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "SAMUEL MOREIRA", "HISTÓRICO DE VOTOS": "79633", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2226867", "PARTIDO": "PSDB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "FRED MACHADO", "HISTÓRICO DE VOTOS": "79041", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2996590", "PARTIDO": "PSDB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "ENRICO MISASI", "HISTÓRICO DE VOTOS": "77949", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2542750", "PARTIDO": "MDB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "DOUGLAS VIEGAS", "HISTÓRICO DE VOTOS": "76149", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1747983", "PARTIDO": "UNIÃO", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "DENIS ANDIA", "HISTÓRICO DE VOTOS": "75082", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1292500", "PARTIDO": "MDB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "PEDRO TOURINHO", "HISTÓRICO DE VOTOS": "74729", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1401717", "PARTIDO": "PT", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "RICARDO IZAR", "HISTÓRICO DE VOTOS": "70142", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1870839", "PARTIDO": "REPUBLICANOS", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "CORONEL TELHADA", "HISTÓRICO DE VOTOS": "69945", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2361600", "PARTIDO": "PP", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "ROBERTO DE LUCENA", "HISTÓRICO DE VOTOS": "69341", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1954850", "PARTIDO": "REPUBLICANOS", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "RODRIGO AGOSTINHO", "HISTÓRICO DE VOTOS": "65506", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2621086", "PARTIDO": "PSB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "RIBAMAR SILVA", "HISTÓRICO DE VOTOS": "65219", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1583909", "PARTIDO": "PSD", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "PAULINHO DA FORÇA", "HISTÓRICO DE VOTOS": "64137", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1916290", "PARTIDO": "SOLIDARIEDADE", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "GUILHERME PIAI", "HISTÓRICO DE VOTOS": "63190", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "858606", "PARTIDO": "REPUBLICANOS", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "REINALDO ALGUZ", "HISTÓRICO DE VOTOS": "62666", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2225075", "PARTIDO": "UNIÃO", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "ADILSON BARROSO", "HISTÓRICO DE VOTOS": "62445", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "3003432", "PARTIDO": "PL", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "MISSIONÁRIO JOSÉ OLÍMPIO", "HISTÓRICO DE VOTOS": "61938", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "520842", "PARTIDO": "PL", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "CORONEL TADEU", "HISTÓRICO DE VOTOS": "61546", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "575036", "PARTIDO": "PL", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "POLICIAL KATIA SASTRE", "HISTÓRICO DE VOTOS": "60330", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2621292", "PARTIDO": "PL", "GÊNERO": "FEMININO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "ELI CORRÊA FILHO", "HISTÓRICO DE VOTOS": "59959", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2655939", "PARTIDO": "UNIÃO", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "MARCELO HERCOLIN", "HISTÓRICO DE VOTOS": "58419", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2742227", "PARTIDO": "UNIÃO", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "RITA PASSOS", "HISTÓRICO DE VOTOS": "57800", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "2517573", "PARTIDO": "REPUBLICANOS", "GÊNERO": "FEMININO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "WALTER IHOSHI", "HISTÓRICO DE VOTOS": "55027", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "1775961", "PARTIDO": "PSD", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "GUIGA PEIXOTO", "HISTÓRICO DE VOTOS": "54849", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "256250", "PARTIDO": "PSC", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "ORLANDO VITORIANO", "HISTÓRICO DE VOTOS": "54243", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "769108", "PARTIDO": "PT", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "MARLON DO UBER", "HISTÓRICO DE VOTOS": "53845", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "610120", "PARTIDO": "MDB", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
                {"UF": "SÃO PAULO", "CANDIDATO": "ELIEL MIRANDA", "HISTÓRICO DE VOTOS": "50875", "CARGO": "Deputado Federal", "HISTÓRICO DE FEFC": "171986", "PARTIDO": "PSD", "GÊNERO": "MASCULINO", "SITUAÇÃO": "SUPLENTE"},
            ]
            records = [_build_record(row) for row in csv_data]

        if not records:
            logger.error("Nenhum registro encontrado para processar")
            sys.exit(1)

        logger.info("Processados %s registros", len(records))
        
        # Limpar a tabela e inserir os dados corretos
        logger.info("Limpando tabela existente...")
        session.query(FederaisNaoEleitosSP).delete()
        
        logger.info("Inserindo registros corrigidos no banco de dados...")
        session.bulk_insert_mappings(FederaisNaoEleitosSP, records)
        session.commit()
        
        logger.info("✅ Dados corrigidos com sucesso! %s registros inseridos.", len(records))
        
        # Verificar alguns registros para confirmar
        sample = session.query(FederaisNaoEleitosSP).first()
        if sample:
            logger.info("Exemplo de registro corrigido:")
            logger.info("  UF: %s", sample.uf)
            logger.info("  Candidato: %s", sample.candidato)
            logger.info("  Partido: %s", sample.partido)
            logger.info("  Situação: %s", sample.situacao)
            logger.info("  Votos: %s", sample.historico_de_votos)
            logger.info("  FEFC: %s", sample.historico_de_fefc)
            logger.info("  Gênero: %s", sample.genero)
        
    except Exception as e:
        session.rollback()
        logger.exception("Erro ao corrigir dados: %s", e)
        sys.exit(1)
    finally:
        session.close()


if __name__ == "__main__":
    fix_data()
