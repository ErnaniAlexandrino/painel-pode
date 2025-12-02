import csv
import logging
import unicodedata
from pathlib import Path
from typing import Dict

from sqlalchemy.orm import Session

from ..models import FederaisNaoEleitosSP
from ..session import SessionLocal

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


def seed_federais_nao_eleitos_sp(force: bool = False) -> None:
    # O arquivo está na raiz do projeto ou no diretório data do backend
    # Tentamos múltiplos caminhos possíveis, priorizando o diretório data
    possible_paths = []
    
    # Caminho 1: Diretório data do backend (dentro do container: /app/data)
    # Caminho: backend/app/db/seeders/federais_nao_eleitos_sp_seeder.py
    # parents[0] = seeders, parents[1] = db, parents[2] = app, parents[3] = backend
    backend_data = Path(__file__).resolve().parents[3] / "data" / "SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv"
    possible_paths.append(backend_data)
    
    # Caminho 2: Dentro do container Docker (/app/data) - nome completo
    possible_paths.append(Path("/app/data/SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv"))
    
    # Caminho 2b: Dentro do container Docker (/app/data) - nome alternativo
    possible_paths.append(Path("/app/data/federais.csv"))
    
    # Caminho 3: Raiz do projeto (desenvolvimento local)
    # parents[4] = raiz do projeto
    project_root = Path(__file__).resolve().parents[4]
    possible_paths.append(project_root / "SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv")
    
    # Caminho 4: Dentro do container Docker (se montado como volume)
    possible_paths.append(Path("/workspace/SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv"))
    
    # Procurar o arquivo em todos os caminhos possíveis
    data_path = None
    for path in possible_paths:
        logger.info("Procurando arquivo CSV em: %s", path)
        if path.exists():
            data_path = path
            logger.info("Arquivo CSV encontrado em: %s", data_path)
            break
    
    if not data_path or not data_path.exists():
        logger.error("Arquivo de seed não encontrado em nenhum dos caminhos tentados:")
        for path in possible_paths:
            logger.error("  - %s (existe: %s)", path, path.exists())
        return

    logger.info("Arquivo CSV encontrado: %s", data_path)

    session: Session = SessionLocal()
    try:
        if not force and session.query(FederaisNaoEleitosSP).first():
            logger.info("Seed de federais não eleitos SP já foi executado anteriormente. Pulando.")
            return

        logger.info("Lendo arquivo CSV...")
        with data_path.open(encoding="utf-8-sig", newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            records = [_build_record(row) for row in reader]

        if not records:
            logger.warning("Nenhum registro encontrado no arquivo %s", data_path)
            return

        logger.info("Processados %s registros do CSV", len(records))
        logger.info("Limpando tabela existente...")
        session.query(FederaisNaoEleitosSP).delete()
        
        logger.info("Inserindo registros no banco de dados...")
        session.bulk_insert_mappings(FederaisNaoEleitosSP, records)
        session.commit()
        logger.info("✅ Seed de federais não eleitos SP concluída com %s registros.", len(records))
    except Exception:
        session.rollback()
        logger.exception("Erro ao executar seed de federais não eleitos SP")
        raise
    finally:
        session.close()

