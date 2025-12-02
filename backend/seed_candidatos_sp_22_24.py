#!/usr/bin/env python
"""Script para executar o seed da tabela candidatos_sp_22_24."""

import logging
import sys
from pathlib import Path

# Adicionar o diretório do backend ao path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.db.models import CandidatosSP2224
from app.db.session import Base, engine
from app.db.seeders.candidatos_sp_22_24_seeder import seed_candidatos_sp_22_24

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    """Função principal para criar a tabela e executar o seed."""
    try:
        # Criar a tabela se não existir
        logger.info("Criando tabela candidatos_sp_22_24 se não existir...")
        Base.metadata.create_all(bind=engine, tables=[CandidatosSP2224.__table__])
        logger.info("Tabela criada/verificada com sucesso.")

        # Executar o seed
        logger.info("Iniciando seed de candidatos SP 22/24...")
        seed_candidatos_sp_22_24(force=True)
        logger.info("Seed concluído com sucesso!")

    except Exception as e:
        logger.error("Erro ao executar seed: %s", e)
        raise


if __name__ == "__main__":
    main()

