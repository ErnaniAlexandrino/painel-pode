#!/usr/bin/env python
"""
Script para importar dados do CSV candidatos_sp_2020_tratado.csv para a tabela candidatos_sp_22_24 em PRODUÇÃO.

Uso padrão (produção):
    python backend/import_candidatos_2020_prod.py

Ou com parâmetros personalizados:
    python backend/import_candidatos_2020_prod.py --host SEU_HOST --port 3307 --user root --password SUA_SENHA --database pwa_db

Com CSV personalizado:
    python backend/import_candidatos_2020_prod.py --csv caminho/para/arquivo.csv
"""

import argparse
import csv
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List

import mysql.connector
from mysql.connector import Error

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Mapeamento CSV -> Tabela
FIELD_MAPPING = {
    'ano': 'ano',
    'cargo': 'cargo',
    'sigla_partido': 'partido',
    'votos': 'votos',
    'resultado': 'resultado',
    'resultado_agregado': 'resultado_agregado',
    'nome_urna': 'nome_urna',
    'nome': 'nome',
    'genero': 'genero',
    'raca': 'raca',
    'fundo_partidario': 'fundo_partidario',
    'fundo_especial': 'fundo_especial',
    'fundo_total': 'fundo_total',
}

# Campos que precisam de conversão de tipo
INTEGER_FIELDS = {'ano', 'votos'}
FLOAT_FIELDS = {'fundo_partidario', 'fundo_especial', 'fundo_total'}

# Ordem das colunas para INSERT
DB_COLUMNS = ['ano', 'cargo', 'partido', 'votos', 'resultado', 'resultado_agregado', 
              'nome_urna', 'nome', 'genero', 'raca', 'fundo_partidario', 'fundo_especial', 'fundo_total']


def convert_value(value: str, field_name: str) -> Any:
    """Converte o valor do CSV para o tipo correto."""
    if not value or value.strip() == '':
        return None
    
    value = value.strip()
    
    # Campos inteiros
    if field_name in INTEGER_FIELDS:
        try:
            value = value.replace('.', '')
            return int(float(value)) if value else None
        except (ValueError, TypeError):
            logger.warning(f"Valor inválido para campo inteiro {field_name}: {value}")
            return None
    
    # Campos float
    if field_name in FLOAT_FIELDS:
        try:
            value = value.replace(',', '.')
            return float(value) if value else None
        except (ValueError, TypeError):
            logger.warning(f"Valor inválido para campo float {field_name}: {value}")
            return None
    
    # Campos string
    return value if value else None


def map_csv_row(row: Dict[str, str]) -> Dict[str, Any]:
    """Mapeia uma linha do CSV para um dicionário compatível com o banco."""
    mapped_data = {}
    
    for csv_field, db_field in FIELD_MAPPING.items():
        if csv_field in row:
            value = row[csv_field]
            mapped_data[db_field] = convert_value(value, db_field)
        else:
            mapped_data[db_field] = None
    
    return mapped_data


def read_csv(csv_path: Path) -> List[Dict[str, Any]]:
    """Lê o arquivo CSV e retorna lista de registros mapeados."""
    records = []
    
    logger.info(f"Lendo arquivo CSV: {csv_path}")
    
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',')
        
        # Verificar colunas
        csv_columns = reader.fieldnames
        missing_columns = [col for col in FIELD_MAPPING.keys() if col not in csv_columns]
        if missing_columns:
            logger.warning(f"Colunas não encontradas no CSV: {missing_columns}")
        
        for row in reader:
            mapped_data = map_csv_row(row)
            records.append(mapped_data)
    
    logger.info(f"Total de registros lidos: {len(records)}")
    return records


def insert_records(connection, records: List[Dict[str, Any]], batch_size: int = 1000):
    """Insere os registros no banco de dados em lotes."""
    cursor = connection.cursor()
    
    # Query de INSERT
    columns_str = ', '.join(DB_COLUMNS)
    placeholders = ', '.join(['%s'] * len(DB_COLUMNS))
    insert_query = f"INSERT INTO candidatos_sp_22_24 ({columns_str}) VALUES ({placeholders})"
    
    total_inserted = 0
    batch = []
    
    for record in records:
        # Criar tupla de valores na ordem correta
        values = tuple(record.get(col) for col in DB_COLUMNS)
        batch.append(values)
        
        if len(batch) >= batch_size:
            try:
                cursor.executemany(insert_query, batch)
                connection.commit()
                total_inserted += len(batch)
                logger.info(f"Importados {total_inserted} registros...")
                batch = []
            except Error as e:
                logger.error(f"Erro ao inserir lote: {e}")
                connection.rollback()
                raise
    
    # Inserir registros restantes
    if batch:
        try:
            cursor.executemany(insert_query, batch)
            connection.commit()
            total_inserted += len(batch)
        except Error as e:
            logger.error(f"Erro ao inserir lote final: {e}")
            connection.rollback()
            raise
    
    cursor.close()
    logger.info(f"Total de registros inseridos: {total_inserted}")
    return total_inserted


def main():
    """Função principal."""
    parser = argparse.ArgumentParser(
        description="Importa dados do CSV candidatos_sp_2020_tratado.csv para a tabela candidatos_sp_22_24 em produção"
    )
    parser.add_argument("--host", default="147.79.81.117", help="Host do banco MySQL (default: 147.79.81.117)")
    parser.add_argument("--port", type=int, default=3307, help="Porta do MySQL (default: 3307)")
    parser.add_argument("--user", default="root", help="Usuário do banco (default: root)")
    parser.add_argument("--password", default="root", help="Senha do banco (default: root)")
    parser.add_argument("--database", default="pwa_db", help="Nome do banco de dados (default: pwa_db)")
    parser.add_argument("--csv", default=None, help="Caminho para o arquivo CSV (default: backend/data/candidatos_sp_2020_tratado.csv)")
    parser.add_argument("--batch-size", type=int, default=1000, help="Tamanho do lote para inserção (default: 1000)")
    
    args = parser.parse_args()
    
    # Determinar caminho do CSV
    if args.csv:
        csv_path = Path(args.csv)
    else:
        script_dir = Path(__file__).resolve().parent
        csv_path = script_dir / "data" / "candidatos_sp_2020_tratado.csv"
    
    if not csv_path.exists():
        logger.error(f"Arquivo CSV não encontrado: {csv_path}")
        sys.exit(1)
    
    logger.info("=" * 60)
    logger.info("Importação de Candidatos SP 2020 - PRODUÇÃO")
    logger.info("=" * 60)
    
    # Ler CSV
    records = read_csv(csv_path)
    
    if not records:
        logger.error("Nenhum registro encontrado no CSV")
        sys.exit(1)
    
    # Conectar ao banco
    logger.info(f"Conectando ao banco de dados {args.user}@{args.host}:{args.port}/{args.database}...")
    
    try:
        connection = mysql.connector.connect(
            host=args.host,
            port=args.port,
            user=args.user,
            password=args.password,
            database=args.database,
            charset="utf8mb4"
        )
        
        if connection.is_connected():
            logger.info("Conexão estabelecida com sucesso!")
            
            # Inserir registros
            insert_records(connection, records, batch_size=args.batch_size)
            
            logger.info("=" * 60)
            logger.info("Importação concluída com sucesso!")
            logger.info("=" * 60)
            
    except Error as e:
        logger.error(f"Erro ao conectar ao banco: {e}")
        sys.exit(1)
    finally:
        if 'connection' in locals() and connection.is_connected():
            connection.close()
            logger.info("Conexão fechada.")


if __name__ == "__main__":
    main()
