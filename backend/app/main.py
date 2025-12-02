import logging
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from .api.v1.api import api_router
from .api.v1.endpoints import candidato_grid
from .db.base import Base
from .db.seeders.candidato_sp_seeder import seed_candidatos_sp
from .db.seeders.federais_nao_eleitos_sp_seeder import seed_federais_nao_eleitos_sp
from .db.session import engine

logger = logging.getLogger(__name__)

app = FastAPI(title="PWA Backend")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def create_tables_with_retry(max_attempts: int = 10, delay: int = 3) -> None:
    attempt = 1
    while attempt <= max_attempts:
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            if attempt == max_attempts:
                logger.exception("Falha ao conectar ao banco de dados após %s tentativas.", attempt)
                raise
            logger.warning(
                "Banco de dados indisponível. Tentando novamente em %s segundos (%s/%s).",
                delay,
                attempt,
                max_attempts,
            )
            time.sleep(delay)
            attempt += 1


@app.on_event("startup")
def on_startup() -> None:
    create_tables_with_retry()
    seed_candidatos_sp(force=True)
    seed_federais_nao_eleitos_sp(force=True)


app.include_router(api_router, prefix="/api/v1")
app.include_router(candidato_grid.router, prefix="/api")
