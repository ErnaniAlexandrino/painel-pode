import csv
import logging
import unicodedata
from pathlib import Path
from typing import Any, Dict

from sqlalchemy.orm import Session

from ..models import CandidatosSP2224
from ..session import SessionLocal

logger = logging.getLogger(__name__)

EXPECTED_FIELDS = {
    "sequencial_restultado",
    "sequencial_candidato",
    "sequencial_fundo",
    "ano",
    "titulo_eleitoral",
    "nome",
    "nome_urna",
    "raca",
    "genero",
    "cargo",
    "partido",
    "resultado",
    "resultado_agregado",
    "votos",
    "fundo_especial",
    "fundo_partidario",
    "fundo_total",
    "ordem",
}

INTEGER_FIELDS = {"ano", "votos", "ordem"}
FLOAT_FIELDS = {"fundo_especial", "fundo_partidario", "fundo_total"}


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


def _parse_value(field: str, value: str) -> Any:
    value = value.strip()
    if value == "":
        return None
    if field in INTEGER_FIELDS:
        try:
            return int(value.replace(".", "").replace(",", ""))
        except ValueError:
            logger.warning("Valor inteiro inválido para campo %s: %s", field, value)
            return None
    if field in FLOAT_FIELDS:
        try:
            # Tratar formato brasileiro (vírgula como decimal)
            return float(value.replace(",", "."))
        except ValueError:
            logger.warning("Valor float inválido para campo %s: %s", field, value)
            return None
    return value


def _build_record(row: Dict[str, str]) -> Dict[str, Any]:
    record: Dict[str, Any] = {}
    for column, value in row.items():
        field = _normalize_column(column)
        if field not in EXPECTED_FIELDS:
            continue
        record[field] = _parse_value(field, value or "")

    missing_fields = EXPECTED_FIELDS.difference(record.keys())
    for field in missing_fields:
        record[field] = None
    return record


def seed_candidatos_sp_22_24(force: bool = False) -> None:
    data_path = Path(__file__).resolve().parents[3] / "data" / "candidatos_cargo_2022_2024.csv"
    if not data_path.exists():
        logger.error("Arquivo de seed não encontrado em %s", data_path)
        return

    session: Session = SessionLocal()
    try:
        if not force and session.query(CandidatosSP2224).first():
            logger.info("Seed de candidatos SP 22/24 já foi executado anteriormente. Pulando.")
            return

        with data_path.open(encoding="utf-8-sig", newline="") as csvfile:
            reader = csv.DictReader(csvfile)
            records = [_build_record(row) for row in reader]

        if not records:
            logger.warning("Nenhum registro encontrado no arquivo %s", data_path)
            return

        session.query(CandidatosSP2224).delete()
        session.bulk_insert_mappings(CandidatosSP2224, records)
        session.commit()
        logger.info("Seed de candidatos SP 22/24 concluída com %s registros.", len(records))
    except Exception:
        session.rollback()
        logger.exception("Erro ao executar seed de candidatos SP 22/24")
        raise
    finally:
        session.close()

