#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para corrigir os dados da tabela federais_nao_eleitos_sp
usando strings Unicode corretas.
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.orm import Session
from app.db.models import FederaisNaoEleitosSP
from app.db.session import SessionLocal

# Dados com encoding correto usando strings Unicode
dados_corretos = [
    {"uf": "SÃO PAULO", "candidato": "PABLO MARÇAL", "historico_de_votos": 243037, "cargo": "Deputado Federal", "historico_de_fefc": 1439254, "partido": "PROS", "genero": "MASCULINO", "situacao": "NÃO ELEITO"},
    {"uf": "SÃO PAULO", "candidato": "ORLANDO SILVA", "historico_de_votos": 108059, "cargo": "Deputado Federal", "historico_de_fefc": 2575274, "partido": "PC do B", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "PROFESSOR HOC, HENI OZI CUKIER", "historico_de_votos": 98720, "cargo": "Deputado Federal", "historico_de_fefc": 1541100, "partido": "PODE", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "DEPUTADO ALFREDINHO", "historico_de_votos": 97063, "cargo": "Deputado Federal", "historico_de_fefc": 1807512, "partido": "PT", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "PROF. MARCO ANTONIO VILLA", "historico_de_votos": 95745, "cargo": "Deputado Federal", "historico_de_fefc": 2001975, "partido": "CIDADANIA", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "ELY SANTOS", "historico_de_votos": 93305, "cargo": "Deputado Federal", "historico_de_fefc": 2513831, "partido": "REPUBLICANOS", "genero": "FEMININO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "ROBERTO ALVES", "historico_de_votos": 92566, "cargo": "Deputado Federal", "historico_de_fefc": 1509713, "partido": "REPUBLICANOS", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "EDUARDO CURY", "historico_de_votos": 92225, "cargo": "Deputado Federal", "historico_de_fefc": 1968455, "partido": "PSDB", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "ADRILLES JORGE", "historico_de_votos": 91485, "cargo": "Deputado Federal", "historico_de_fefc": 1558445, "partido": "PTB", "genero": "MASCULINO", "situacao": "NÃO ELEITO"},
    {"uf": "SÃO PAULO", "candidato": "JOSÉ SERRA", "historico_de_votos": 88926, "cargo": "Deputado Federal", "historico_de_fefc": 3175000, "partido": "PSDB", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "VANDERLEI MACRIS", "historico_de_votos": 87502, "cargo": "Deputado Federal", "historico_de_fefc": 3096834, "partido": "PSDB", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "VICENTINHO", "historico_de_votos": 82912, "cargo": "Deputado Federal", "historico_de_fefc": 2339990, "partido": "PT", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "SAULO PEDROSO", "historico_de_votos": 80186, "cargo": "Deputado Federal", "historico_de_fefc": 1251056, "partido": "PSD", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "JOÃO CURY", "historico_de_votos": 80085, "cargo": "Deputado Federal", "historico_de_fefc": 2734346, "partido": "MDB", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "SAMUEL MOREIRA", "historico_de_votos": 79633, "cargo": "Deputado Federal", "historico_de_fefc": 2226867, "partido": "PSDB", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "FRED MACHADO", "historico_de_votos": 79041, "cargo": "Deputado Federal", "historico_de_fefc": 2996590, "partido": "PSDB", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "ENRICO MISASI", "historico_de_votos": 77949, "cargo": "Deputado Federal", "historico_de_fefc": 2542750, "partido": "MDB", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "DOUGLAS VIEGAS", "historico_de_votos": 76149, "cargo": "Deputado Federal", "historico_de_fefc": 1747983, "partido": "UNIÃO", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "DENIS ANDIA", "historico_de_votos": 75082, "cargo": "Deputado Federal", "historico_de_fefc": 1292500, "partido": "MDB", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "PEDRO TOURINHO", "historico_de_votos": 74729, "cargo": "Deputado Federal", "historico_de_fefc": 1401717, "partido": "PT", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "RICARDO IZAR", "historico_de_votos": 70142, "cargo": "Deputado Federal", "historico_de_fefc": 1870839, "partido": "REPUBLICANOS", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "CORONEL TELHADA", "historico_de_votos": 69945, "cargo": "Deputado Federal", "historico_de_fefc": 2361600, "partido": "PP", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "ROBERTO DE LUCENA", "historico_de_votos": 69341, "cargo": "Deputado Federal", "historico_de_fefc": 1954850, "partido": "REPUBLICANOS", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "RODRIGO AGOSTINHO", "historico_de_votos": 65506, "cargo": "Deputado Federal", "historico_de_fefc": 2621086, "partido": "PSB", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "RIBAMAR SILVA", "historico_de_votos": 65219, "cargo": "Deputado Federal", "historico_de_fefc": 1583909, "partido": "PSD", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "PAULINHO DA FORÇA", "historico_de_votos": 64137, "cargo": "Deputado Federal", "historico_de_fefc": 1916290, "partido": "SOLIDARIEDADE", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "GUILHERME PIAI", "historico_de_votos": 63190, "cargo": "Deputado Federal", "historico_de_fefc": 858606, "partido": "REPUBLICANOS", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "REINALDO ALGUZ", "historico_de_votos": 62666, "cargo": "Deputado Federal", "historico_de_fefc": 2225075, "partido": "UNIÃO", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "ADILSON BARROSO", "historico_de_votos": 62445, "cargo": "Deputado Federal", "historico_de_fefc": 3003432, "partido": "PL", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "MISSIONÁRIO JOSÉ OLÍMPIO", "historico_de_votos": 61938, "cargo": "Deputado Federal", "historico_de_fefc": 520842, "partido": "PL", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "CORONEL TADEU", "historico_de_votos": 61546, "cargo": "Deputado Federal", "historico_de_fefc": 575036, "partido": "PL", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "POLICIAL KATIA SASTRE", "historico_de_votos": 60330, "cargo": "Deputado Federal", "historico_de_fefc": 2621292, "partido": "PL", "genero": "FEMININO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "ELI CORRÊA FILHO", "historico_de_votos": 59959, "cargo": "Deputado Federal", "historico_de_fefc": 2655939, "partido": "UNIÃO", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "MARCELO HERCOLIN", "historico_de_votos": 58419, "cargo": "Deputado Federal", "historico_de_fefc": 2742227, "partido": "UNIÃO", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "RITA PASSOS", "historico_de_votos": 57800, "cargo": "Deputado Federal", "historico_de_fefc": 2517573, "partido": "REPUBLICANOS", "genero": "FEMININO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "WALTER IHOSHI", "historico_de_votos": 55027, "cargo": "Deputado Federal", "historico_de_fefc": 1775961, "partido": "PSD", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "GUIGA PEIXOTO", "historico_de_votos": 54849, "cargo": "Deputado Federal", "historico_de_fefc": 256250, "partido": "PSC", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "ORLANDO VITORIANO", "historico_de_votos": 54243, "cargo": "Deputado Federal", "historico_de_fefc": 769108, "partido": "PT", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "MARLON DO UBER", "historico_de_votos": 53845, "cargo": "Deputado Federal", "historico_de_fefc": 610120, "partido": "MDB", "genero": "MASCULINO", "situacao": "SUPLENTE"},
    {"uf": "SÃO PAULO", "candidato": "ELIEL MIRANDA", "historico_de_votos": 50875, "cargo": "Deputado Federal", "historico_de_fefc": 171986, "partido": "PSD", "genero": "MASCULINO", "situacao": "SUPLENTE"},
]

def fix_data():
    session: Session = SessionLocal()
    try:
        print(f"Processando {len(dados_corretos)} registros...")
        
        # Limpar a tabela
        print("Limpando tabela existente...")
        session.query(FederaisNaoEleitosSP).delete()
        
        # Inserir dados corretos
        print("Inserindo registros corrigidos...")
        session.bulk_insert_mappings(FederaisNaoEleitosSP, dados_corretos)
        session.commit()
        
        print(f"✅ Dados corrigidos com sucesso! {len(dados_corretos)} registros inseridos.")
        
        # Verificar
        sample = session.query(FederaisNaoEleitosSP).first()
        if sample:
            print("\nExemplo de registro corrigido:")
            print(f"  UF: {sample.uf}")
            print(f"  Candidato: {sample.candidato}")
            print(f"  Partido: {sample.partido}")
            print(f"  Situação: {sample.situacao}")
            print(f"  Votos: {sample.historico_de_votos}")
            print(f"  FEFC: {sample.historico_de_fefc}")
            print(f"  Gênero: {sample.genero}")
        
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









