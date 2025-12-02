"""
Script para adicionar a coluna 'cargo' na tabela candidatos_sp_22_24
e repovoar a tabela com os dados do arquivo candidatos_cargo_2022_2024.csv
"""

import logging
import sys
from pathlib import Path

# Adiciona o diretório backend ao path para imports
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text

from app.db.session import engine
from app.db.seeders.candidatos_sp_22_24_seeder import seed_candidatos_sp_22_24

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def column_exists(connection, table_name: str, column_name: str) -> bool:
    """Verifica se uma coluna existe na tabela."""
    result = connection.execute(
        text(
            "SELECT COUNT(*) FROM information_schema.COLUMNS "
            "WHERE TABLE_SCHEMA = DATABASE() "
            "AND TABLE_NAME = :table_name "
            "AND COLUMN_NAME = :column_name"
        ),
        {"table_name": table_name, "column_name": column_name}
    )
    return result.scalar() > 0


def add_cargo_column(connection) -> bool:
    """Adiciona a coluna 'cargo' na tabela candidatos_sp_22_24."""
    table_name = "candidatos_sp_22_24"
    column_name = "cargo"
    
    if column_exists(connection, table_name, column_name):
        logger.info("Coluna '%s' já existe na tabela '%s'. Pulando criação.", column_name, table_name)
        return True
    
    logger.info("Adicionando coluna '%s' na tabela '%s'...", column_name, table_name)
    
    # Adicionar coluna cargo após genero
    connection.execute(
        text("ALTER TABLE candidatos_sp_22_24 ADD COLUMN cargo VARCHAR(255) NULL AFTER genero")
    )
    
    # Criar índice na coluna cargo
    connection.execute(
        text("CREATE INDEX idx_candidatos_sp_22_24_cargo ON candidatos_sp_22_24(cargo)")
    )
    
    connection.commit()
    logger.info("Coluna '%s' adicionada com sucesso!", column_name)
    return True


def main():
    """Função principal que executa a migração."""
    logger.info("=" * 60)
    logger.info("Iniciando migração: Adicionar coluna 'cargo' e repovoar tabela")
    logger.info("=" * 60)
    
    try:
        # Passo 1: Adicionar coluna 'cargo'
        with engine.connect() as connection:
            add_cargo_column(connection)
        
        # Passo 2: Repovoar a tabela com os novos dados
        logger.info("Repopulando tabela com dados do arquivo candidatos_cargo_2022_2024.csv...")
        seed_candidatos_sp_22_24(force=True)
        
        logger.info("=" * 60)
        logger.info("Migração concluída com sucesso!")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.exception("Erro durante a migração: %s", e)
        sys.exit(1)


if __name__ == "__main__":
    main()

