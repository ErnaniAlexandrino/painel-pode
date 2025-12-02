#!/usr/bin/env python3
"""
Script para popular a tabela federais_nao_eleitos_sp.
Lê o arquivo CSV da raiz do projeto e popula o banco de dados.
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
    value = value.strip()
    if value == "":
        return None
    if field in NUMERIC_FIELDS:
        try:
            return int(value.replace(".", ""))
        except ValueError:
            logger.warning("Valor inválido para campo %s: %s", field, value)
            return None
    return value


def _build_record(row: Dict[str, str]) -> Dict[str, str]:
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


def main():
    # Tentar múltiplos caminhos possíveis
    possible_paths = []
    
    # Caminho 1: Raiz do projeto (um nível acima do backend)
    project_root = backend_dir.parent
    possible_paths.append(project_root / "SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv")
    
    # Caminho 2: Dentro do container Docker (/workspace)
    possible_paths.append(Path("/workspace/SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv"))
    
    # Caminho 3: Diretório data do backend
    possible_paths.append(backend_dir / "data" / "SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv")
    
    # Caminho 4: /app/data dentro do container
    possible_paths.append(Path("/app/data/SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv"))
    
    csv_file = None
    for path in possible_paths:
        logger.info("Procurando arquivo CSV em: %s", path)
        if path.exists():
            csv_file = path
            logger.info("Arquivo CSV encontrado em: %s", csv_file)
            break
    
    if not csv_file or not csv_file.exists():
        logger.error("Arquivo CSV não encontrado em nenhum dos caminhos:")
        for path in possible_paths:
            logger.error("  - %s (existe: %s)", path, path.exists())
        sys.exit(1)
    
    logger.info("Arquivo CSV encontrado: %s", csv_file)
    
    session: Session = SessionLocal()
    try:
        logger.info("Lendo arquivo CSV...")
        with csv_file.open(encoding="utf-8-sig", newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            records = [_build_record(row) for row in reader]

        if not records:
            logger.warning("Nenhum registro encontrado no arquivo")
            sys.exit(1)

        logger.info("Processados %s registros do CSV", len(records))
        logger.info("Limpando tabela existente...")
        session.query(FederaisNaoEleitosSP).delete()
        
        logger.info("Inserindo registros no banco de dados...")
        session.bulk_insert_mappings(FederaisNaoEleitosSP, records)
        session.commit()
        logger.info("✅ Seed concluído com sucesso! %s registros inseridos.", len(records))
    except Exception as e:
        session.rollback()
        logger.exception("Erro ao executar seed: %s", e)
        sys.exit(1)
    finally:
        session.close()


if __name__ == "__main__":
    main()

