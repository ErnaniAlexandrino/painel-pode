#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para corrigir os dados usando UPDATE SQL direto com UTF-8
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.db.session import SessionLocal

# Dados corretos
dados = [
    (1, "SÃO PAULO", "PABLO MARÇAL", 243037, 1439254, "PROS", "MASCULINO", "NÃO ELEITO"),
    (2, "SÃO PAULO", "ORLANDO SILVA", 108059, 2575274, "PC do B", "MASCULINO", "SUPLENTE"),
    (3, "SÃO PAULO", "PROFESSOR HOC, HENI OZI CUKIER", 98720, 1541100, "PODE", "MASCULINO", "SUPLENTE"),
    (4, "SÃO PAULO", "DEPUTADO ALFREDINHO", 97063, 1807512, "PT", "MASCULINO", "SUPLENTE"),
    (5, "SÃO PAULO", "PROF. MARCO ANTONIO VILLA", 95745, 2001975, "CIDADANIA", "MASCULINO", "SUPLENTE"),
    (6, "SÃO PAULO", "ELY SANTOS", 93305, 2513831, "REPUBLICANOS", "FEMININO", "SUPLENTE"),
    (7, "SÃO PAULO", "ROBERTO ALVES", 92566, 1509713, "REPUBLICANOS", "MASCULINO", "SUPLENTE"),
    (8, "SÃO PAULO", "EDUARDO CURY", 92225, 1968455, "PSDB", "MASCULINO", "SUPLENTE"),
    (9, "SÃO PAULO", "ADRILLES JORGE", 91485, 1558445, "PTB", "MASCULINO", "NÃO ELEITO"),
    (10, "SÃO PAULO", "JOSÉ SERRA", 88926, 3175000, "PSDB", "MASCULINO", "SUPLENTE"),
    (11, "SÃO PAULO", "VANDERLEI MACRIS", 87502, 3096834, "PSDB", "MASCULINO", "SUPLENTE"),
    (12, "SÃO PAULO", "VICENTINHO", 82912, 2339990, "PT", "MASCULINO", "SUPLENTE"),
    (13, "SÃO PAULO", "SAULO PEDROSO", 80186, 1251056, "PSD", "MASCULINO", "SUPLENTE"),
    (14, "SÃO PAULO", "JOÃO CURY", 80085, 2734346, "MDB", "MASCULINO", "SUPLENTE"),
    (15, "SÃO PAULO", "SAMUEL MOREIRA", 79633, 2226867, "PSDB", "MASCULINO", "SUPLENTE"),
    (16, "SÃO PAULO", "FRED MACHADO", 79041, 2996590, "PSDB", "MASCULINO", "SUPLENTE"),
    (17, "SÃO PAULO", "ENRICO MISASI", 77949, 2542750, "MDB", "MASCULINO", "SUPLENTE"),
    (18, "SÃO PAULO", "DOUGLAS VIEGAS", 76149, 1747983, "UNIÃO", "MASCULINO", "SUPLENTE"),
    (19, "SÃO PAULO", "DENIS ANDIA", 75082, 1292500, "MDB", "MASCULINO", "SUPLENTE"),
    (20, "SÃO PAULO", "PEDRO TOURINHO", 74729, 1401717, "PT", "MASCULINO", "SUPLENTE"),
    (21, "SÃO PAULO", "RICARDO IZAR", 70142, 1870839, "REPUBLICANOS", "MASCULINO", "SUPLENTE"),
    (22, "SÃO PAULO", "CORONEL TELHADA", 69945, 2361600, "PP", "MASCULINO", "SUPLENTE"),
    (23, "SÃO PAULO", "ROBERTO DE LUCENA", 69341, 1954850, "REPUBLICANOS", "MASCULINO", "SUPLENTE"),
    (24, "SÃO PAULO", "RODRIGO AGOSTINHO", 65506, 2621086, "PSB", "MASCULINO", "SUPLENTE"),
    (25, "SÃO PAULO", "RIBAMAR SILVA", 65219, 1583909, "PSD", "MASCULINO", "SUPLENTE"),
    (26, "SÃO PAULO", "PAULINHO DA FORÇA", 64137, 1916290, "SOLIDARIEDADE", "MASCULINO", "SUPLENTE"),
    (27, "SÃO PAULO", "GUILHERME PIAI", 63190, 858606, "REPUBLICANOS", "MASCULINO", "SUPLENTE"),
    (28, "SÃO PAULO", "REINALDO ALGUZ", 62666, 2225075, "UNIÃO", "MASCULINO", "SUPLENTE"),
    (29, "SÃO PAULO", "ADILSON BARROSO", 62445, 3003432, "PL", "MASCULINO", "SUPLENTE"),
    (30, "SÃO PAULO", "MISSIONÁRIO JOSÉ OLÍMPIO", 61938, 520842, "PL", "MASCULINO", "SUPLENTE"),
    (31, "SÃO PAULO", "CORONEL TADEU", 61546, 575036, "PL", "MASCULINO", "SUPLENTE"),
    (32, "SÃO PAULO", "POLICIAL KATIA SASTRE", 60330, 2621292, "PL", "FEMININO", "SUPLENTE"),
    (33, "SÃO PAULO", "ELI CORRÊA FILHO", 59959, 2655939, "UNIÃO", "MASCULINO", "SUPLENTE"),
    (34, "SÃO PAULO", "MARCELO HERCOLIN", 58419, 2742227, "UNIÃO", "MASCULINO", "SUPLENTE"),
    (35, "SÃO PAULO", "RITA PASSOS", 57800, 2517573, "REPUBLICANOS", "FEMININO", "SUPLENTE"),
    (36, "SÃO PAULO", "WALTER IHOSHI", 55027, 1775961, "PSD", "MASCULINO", "SUPLENTE"),
    (37, "SÃO PAULO", "GUIGA PEIXOTO", 54849, 256250, "PSC", "MASCULINO", "SUPLENTE"),
    (38, "SÃO PAULO", "ORLANDO VITORIANO", 54243, 769108, "PT", "MASCULINO", "SUPLENTE"),
    (39, "SÃO PAULO", "MARLON DO UBER", 53845, 610120, "MDB", "MASCULINO", "SUPLENTE"),
    (40, "SÃO PAULO", "ELIEL MIRANDA", 50875, 171986, "PSD", "MASCULINO", "SUPLENTE"),
]

def fix_data():
    session = SessionLocal()
    try:
        # Primeiro, limpar a tabela
        print("Limpando tabela...")
        session.execute(text("DELETE FROM federais_nao_eleitos_sp"))
        
        # Inserir dados corretos usando SQL direto com UTF-8
        print("Inserindo dados corrigidos...")
        for idx, (_, uf, candidato, votos, fefc, partido, genero, situacao) in enumerate(dados, 1):
            sql = text("""
                INSERT INTO federais_nao_eleitos_sp 
                (uf, candidato, historico_de_votos, cargo, historico_de_fefc, partido, genero, situacao)
                VALUES (:uf, :candidato, :votos, :cargo, :fefc, :partido, :genero, :situacao)
            """)
            session.execute(sql, {
                "uf": uf,
                "candidato": candidato,
                "votos": votos,
                "cargo": "Deputado Federal",
                "fefc": fefc,
                "partido": partido,
                "genero": genero,
                "situacao": situacao
            })
        
        session.commit()
        print(f"✅ {len(dados)} registros inseridos com sucesso!")
        
        # Verificar
        result = session.execute(text("SELECT uf, candidato, situacao FROM federais_nao_eleitos_sp LIMIT 1"))
        row = result.fetchone()
        if row:
            print(f"\nVerificação:")
            print(f"  UF: {row[0]}")
            print(f"  Candidato: {row[1]}")
            print(f"  Situação: {row[2]}")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    fix_data()









