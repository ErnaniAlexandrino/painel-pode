import csv
import logging
import unicodedata
from pathlib import Path
from typing import Dict

from sqlalchemy.orm import Session

from ..models import CandidatoSP
from ..session import SessionLocal

logger = logging.getLogger(__name__)

EXPECTED_FIELDS = {
    "uf",
    "candidato",
    "historico_de_votos",
    "cargo",
    "ano",
    "historico_de_fefc",
    "partido",
    "genero",
    "raca_cor",
    "situacao",
}

NUMERIC_FIELDS = {"historico_de_votos", "historico_de_fefc", "ano"}


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


def seed_candidatos_sp(force: bool = False) -> None:
    data_path = Path(__file__).resolve().parents[3] / "data" / "candidatos_sp_2022.csv"
    if not data_path.exists():
        logger.error("Arquivo de seed não encontrado em %s", data_path)
        return

    session: Session = SessionLocal()
    try:
        if not force and session.query(CandidatoSP).first():
            logger.info("Seed de candidatos SP já foi executado anteriormente. Pulando.")
            return

        with data_path.open(encoding="utf-8-sig", newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            records = [_build_record(row) for row in reader]

        if not records:
            logger.warning("Nenhum registro encontrado no arquivo %s", data_path)
            return

        session.query(CandidatoSP).delete()
        session.bulk_insert_mappings(CandidatoSP, records)
        session.commit()
        logger.info("Seed de candidatos SP concluída com %s registros.", len(records))
    except Exception:
        session.rollback()
        logger.exception("Erro ao executar seed de candidatos SP")
        raise
    finally:
        session.close()
