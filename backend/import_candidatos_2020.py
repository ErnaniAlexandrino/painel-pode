#!/usr/bin/env python
"""Script para importar dados do CSV candidatos_sp_2020_tratado.csv para a tabela candidatos_sp_22_24."""

import csv
import logging
import sys
from pathlib import Path
from typing import Any, Dict, Optional

# Adicionar o diretório do backend ao path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.db.models import CandidatosSP2224
from app.db.session import SessionLocal

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

# Campos ignorados do CSV (não serão inseridos)
IGNORED_FIELDS = {
    'sigla_uf', 'id_municipio_tse', 'municipio', 'numero_candidato',
    'idade', 'instrucao', 'ocupacao', '#NULO', 'FUNDO ESPECIAL',
    'FUNDO PARTIDARIO', 'OUTROS RECURSOS'
}


def convert_value(value: str, field_name: str) -> Any:
    """Converte o valor do CSV para o tipo correto."""
    if not value or value.strip() == '':
        return None
    
    value = value.strip()
    
    # Campos inteiros
    if field_name in INTEGER_FIELDS:
        try:
            # Remove pontos de milhar se houver
            value = value.replace('.', '')
            return int(float(value)) if value else None
        except (ValueError, TypeError):
            logger.warning(f"Valor inválido para campo inteiro {field_name}: {value}")
            return None
    
    # Campos float
    if field_name in FLOAT_FIELDS:
        try:
            # Substitui vírgula por ponto para conversão
            value = value.replace(',', '.')
            return float(value) if value else None
        except (ValueError, TypeError):
            logger.warning(f"Valor inválido para campo float {field_name}: {value}")
            return None
    
    # Campos string
    return value if value else None


def map_csv_row_to_model(row: Dict[str, str]) -> Dict[str, Any]:
    """Mapeia uma linha do CSV para um dicionário compatível com o modelo."""
    mapped_data = {}
    
    for csv_field, db_field in FIELD_MAPPING.items():
        if csv_field in row:
            value = row[csv_field]
            mapped_data[db_field] = convert_value(value, db_field)
        else:
            mapped_data[db_field] = None
    
    return mapped_data


def import_csv_to_database(csv_path: Path, batch_size: int = 1000):
    """Importa dados do CSV para o banco de dados."""
    db = SessionLocal()
    
    try:
        logger.info(f"Iniciando importação do arquivo: {csv_path}")
        
        if not csv_path.exists():
            raise FileNotFoundError(f"Arquivo não encontrado: {csv_path}")
        
        total_rows = 0
        inserted_rows = 0
        batch = []
        
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            # Usar vírgula como delimitador (padrão do arquivo)
            reader = csv.DictReader(csvfile, delimiter=',')
            
            # Verificar se as colunas esperadas existem
            csv_columns = reader.fieldnames
            missing_columns = [col for col in FIELD_MAPPING.keys() if col not in csv_columns]
            if missing_columns:
                logger.warning(f"Colunas não encontradas no CSV: {missing_columns}")
            
            logger.info(f"Lendo arquivo CSV...")
            
            for row_num, row in enumerate(reader, start=2):  # Começa em 2 (linha 1 é header)
                total_rows += 1
                
                try:
                    # Mapear linha do CSV para o modelo
                    mapped_data = map_csv_row_to_model(row)
                    
                    # Criar instância do modelo
                    candidato = CandidatosSP2224(**mapped_data)
                    batch.append(candidato)
                    
                    # Inserir em lotes
                    if len(batch) >= batch_size:
                        db.bulk_save_objects(batch)
                        db.commit()
                        inserted_rows += len(batch)
                        logger.info(f"Importados {inserted_rows} registros...")
                        batch = []
                
                except Exception as e:
                    logger.error(f"Erro ao processar linha {row_num}: {e}")
                    logger.error(f"Dados da linha: {row}")
                    continue
            
            # Inserir registros restantes
            if batch:
                db.bulk_save_objects(batch)
                db.commit()
                inserted_rows += len(batch)
        
        logger.info(f"Importação concluída!")
        logger.info(f"Total de linhas processadas: {total_rows}")
        logger.info(f"Total de registros inseridos: {inserted_rows}")
        
    except Exception as e:
        logger.error(f"Erro durante a importação: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    """Função principal."""
    try:
        # Caminho do arquivo CSV
        script_dir = Path(__file__).resolve().parent
        csv_path = script_dir / "data" / "candidatos_sp_2020_tratado.csv"
        
        logger.info("=" * 60)
        logger.info("Importação de Candidatos SP 2020")
        logger.info("=" * 60)
        
        # Importar dados
        import_csv_to_database(csv_path, batch_size=1000)
        
        logger.info("=" * 60)
        logger.info("Importação finalizada com sucesso!")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Erro ao executar importação: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
