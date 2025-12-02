from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from ..core.config import settings

# Adicionar parâmetros para garantir UTF-8
database_url = settings.database_url
if "mysql" in database_url or "mariadb" in database_url:
    # Adicionar charset=utf8mb4 se não estiver presente
    if "charset=" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}charset=utf8mb4"

engine = create_engine(database_url, pool_pre_ping=True, connect_args={"charset": "utf8mb4"} if "mysql" in database_url or "mariadb" in database_url else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
