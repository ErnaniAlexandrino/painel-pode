#!/usr/bin/env python3
"""
Script para popular a tabela federais_nao_eleitos_sp com dados do CSV.
Execute este script a partir do diretório backend:
    python seed_federais_nao_eleitos.py
"""
import logging
import sys
from pathlib import Path

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Adiciona o diretório app ao path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.db.seeders.federais_nao_eleitos_sp_seeder import seed_federais_nao_eleitos_sp

if __name__ == "__main__":
    print("🌱 Iniciando seed de federais não eleitos SP...")
    try:
        seed_federais_nao_eleitos_sp(force=True)
        print("✅ Seed concluído com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao executar seed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

