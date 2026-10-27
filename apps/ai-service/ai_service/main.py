import logging
import secrets
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine, text


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AI_")
    database_url: str
    service_token: str


class Health(BaseModel):
    status: Literal["up", "down"]


settings = Settings()
if len(settings.service_token) < 32:
    raise ValueError("AI_SERVICE_TOKEN must contain at least 32 characters")
engine = create_engine(
    settings.database_url,
    connect_args={"connect_timeout": 2, "options": "-c statement_timeout=2000"},
)
app = FastAPI(openapi_url=None, docs_url=None, redoc_url=None)
logging.basicConfig(
    format='{"service":"ai-service","level":"%(levelname)s","message":"%(message)s"}'
)


def authenticate(x_service_token: str = Header(default="")) -> None:
    if not secrets.compare_digest(x_service_token, settings.service_token):
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.exception_handler(HTTPException)
async def problem_handler(request: object, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        media_type="application/problem+json",
        content={"type": "about:blank", "title": str(exc.detail), "status": exc.status_code},
    )


@app.get("/internal/v1/health/live", response_model=Health, dependencies=[Depends(authenticate)])
def live() -> Health:
    return Health(status="up")


@app.get("/internal/v1/health/ready", response_model=Health, dependencies=[Depends(authenticate)])
def ready() -> JSONResponse:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT marker FROM ai.foundation WHERE id = 1"))
        return JSONResponse(content={"status": "up"})
    except Exception:
        return JSONResponse(status_code=503, content={"status": "down"})
