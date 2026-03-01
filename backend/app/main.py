import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import produtos, caixa, gis, auth

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.services.gis_service import _carregar_geodataframe
    try:
        _carregar_geodataframe()
        logger.info("GeoJSON carregado com sucesso")
    except FileNotFoundError as e:
        logger.warning("GeoJSON não encontrado: %s", e)
    yield


app = FastAPI(
    title="Sigma API",
    description="API do Desafio Sigma — CRUD, Fluxo de Caixa, GIS e Auth JWT",
    version="1.0.0",
    lifespan=lifespan,
    swagger_ui_parameters={
        "defaultModelsExpandDepth": 1,
        "defaultModelExpandDepth": 1,
        "displayRequestDuration": True,
    },
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        campo = str(error["loc"][-1]) if error["loc"] else "campo"
        errors.append({
            "campo": campo,
            "mensagem": error["msg"].replace("Input should be", "O campo deve ser")
                                   .replace("Field required", "Campo obrigatório")
                                   .replace("greater than", "maior que")
                                   .replace("less than or equal to", "menor ou igual a")
                                   .replace("greater than or equal to", "maior ou igual a"),
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": errors},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Auth"])
app.include_router(produtos.router, prefix="/produtos", tags=["Produtos"])
app.include_router(caixa.router, prefix="/caixa", tags=["Caixa"])
app.include_router(gis.router, prefix="/gis", tags=["GIS"])
