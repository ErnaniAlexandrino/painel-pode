#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script final para corrigir os dados lendo o CSV original com encoding correto
"""
import csv
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from app.db.session import SessionLocal

def fix_data():
    # Ler o CSV da raiz do projeto
    csv_file = backend_dir.parent / "SÃO PAULO_TOP_40_FEDERAIS_NAO_ELEITOS_2022.csv"
    
    if not csv_file.exists():
        print(f"Arquivo não encontrado: {csv_file}")
        sys.exit(1)
    
    session = SessionLocal()
    try:
        print("Lendo arquivo CSV...")
        # Tentar diferentes encodings comuns no Windows
        encodings = ["latin-1", "cp1252", "iso-8859-1", "utf-8-sig", "utf-8"]
        records = []
        
        for encoding in encodings:
            try:
                with csv_file.open(encoding=encoding, newline="") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        # Converter valores numéricos
                        votos = int(row["HISTÓRICO DE VOTOS"].replace(".", "")) if row["HISTÓRICO DE VOTOS"] else None
                        fefc = int(row["HISTÓRICO DE FEFC"].replace(".", "")) if row["HISTÓRICO DE FEFC"] else None
                        
                        records.append({
                            "uf": row["UF"].strip(),
                            "candidato": row["CANDIDATO"].strip(),
                            "votos": votos,
                            "cargo": row["CARGO"].strip(),
                            "fefc": fefc,
                            "partido": row["PARTIDO"].strip(),
                            "genero": row["GÊNERO"].strip() if row["GÊNERO"] else None,
                            "situacao": row["SITUAÇÃO"].strip() if row["SITUAÇÃO"] else None,
                        })
                print(f"Arquivo lido com sucesso usando encoding: {encoding}")
                print(f"Primeiro registro - UF: {records[0]['uf']}, Candidato: {records[0]['candidato']}")
                break
            except (UnicodeDecodeError, KeyError) as e:
                print(f"Falha com encoding {encoding}: {e}")
                records = []
                continue
        
        if not records:
            print("Não foi possível ler o arquivo CSV com nenhum encoding")
            sys.exit(1)
        
        print(f"\nProcessados {len(records)} registros")
        print("Limpando tabela...")
        session.execute(text("DELETE FROM federais_nao_eleitos_sp"))
        
        print("Inserindo dados corrigidos...")
        for record in records:
            sql = text("""
                INSERT INTO federais_nao_eleitos_sp 
                (uf, candidato, historico_de_votos, cargo, historico_de_fefc, partido, genero, situacao)
                VALUES (:uf, :candidato, :votos, :cargo, :fefc, :partido, :genero, :situacao)
            """)
            session.execute(sql, record)
        
        session.commit()
        print(f"✅ {len(records)} registros inseridos com sucesso!")
        
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









