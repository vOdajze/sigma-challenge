import os
os.environ["ENABLE_AUTH"] = "false"

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool  

from app.core.database import Base, get_db
from app.main import app as fastapi_app

import app.models.produto       # noqa: F401
import app.models.movimentacao  # noqa: F401
import app.models.usuario       # noqa: F401

DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool, 
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    fastapi_app.dependency_overrides[get_db] = override_get_db

    with patch("app.services.gis_service._carregar_geodataframe"):
        with TestClient(fastapi_app) as c:
            yield c

    fastapi_app.dependency_overrides.clear()


@pytest.fixture
def produto_payload():
    return {"nome": "Produto Teste", "descricao": "Desc", "preco": "10.00"}


@pytest.fixture
def produto_criado(client, produto_payload):
    resp = client.post("/produtos", json=produto_payload)
    assert resp.status_code == 201, f"Falhou ao criar produto: {resp.json()}"
    return resp.json()
