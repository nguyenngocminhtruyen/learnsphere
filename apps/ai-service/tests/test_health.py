import os
from unittest.mock import patch

os.environ.setdefault("AI_DATABASE_URL", "postgresql+psycopg://ai_app:local@localhost/edutech")
os.environ.setdefault("AI_SERVICE_TOKEN", "test-service-token-with-32-characters")
from ai_service.main import app, settings
from fastapi.testclient import TestClient

client = TestClient(app)


def test_private_health() -> None:
    for path in ("live", "ready"):
        response = client.get(f"/internal/v1/health/{path}")
        assert response.status_code == 401
        assert response.headers["content-type"] == "application/problem+json"
    assert client.get(
        "/internal/v1/health/live", headers={"X-Service-Token": settings.service_token}
    ).json() == {"status": "up"}


def test_readiness_failure() -> None:
    with patch("ai_service.main.engine.connect", side_effect=RuntimeError):
        assert (
            client.get(
                "/internal/v1/health/ready", headers={"X-Service-Token": settings.service_token}
            ).status_code
            == 503
        )


def test_authoritative_contract() -> None:
    import json
    from pathlib import Path

    contract = json.loads(
        (Path(__file__).resolve().parents[3] / "contracts/openapi/ai-internal.yaml").read_text()
    )
    for path in contract["paths"]:
        assert client.get(path).status_code == 401
    assert client.get("/docs").status_code == 404
