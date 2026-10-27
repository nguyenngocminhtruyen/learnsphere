"""Run after docker compose up -d; proves boot, contracts and SQL isolation."""
import os
import json
import subprocess
import time
from urllib.request import urlopen


def run(*args: str) -> str:
    return subprocess.check_output(["docker", "compose", *args], text=True).strip()


for port, path in [(int(os.getenv("API_PORT", "8080")), "/health/live"), (int(os.getenv("API_PORT", "8080")), "/health/ready"), (int(os.getenv("WEB_PORT", "3000")), "/")]:
    for attempt in range(120):
        try:
            with urlopen(f"http://localhost:{port}{path}", timeout=3) as response:
                assert response.status == 200
                if path.startswith("/health/"):
                    assert json.load(response) == {"status": "up"}
            break
        except Exception:
            if attempt == 119:
                raise
            time.sleep(1)
assert run("exec", "-T", "postgres", "psql", "-U", "postgres", "-d", "edutech", "-Atc", "SELECT extname FROM pg_extension WHERE extname='vector'") == "vector"
for query, expected in [
    ("SELECT version FROM lms.flyway_schema_history WHERE success", "1"),
    ("SELECT version_num FROM ai.alembic_version", "0001"),
]:
    assert run("exec", "-T", "postgres", "psql", "-U", "postgres", "-d", "edutech", "-Atc", query) == expected
for role, own, other in [("lms_app", "lms", "ai"), ("ai_app", "ai", "lms")]:
    run("exec", "-T", "postgres", "psql", "-U", "postgres", "-d", "edutech", "-v", "ON_ERROR_STOP=1", "-c", f"SET ROLE {role}; UPDATE {own}.foundation SET marker='phase-0' WHERE id=1;")
    for sql in [f"UPDATE {other}.foundation SET marker='bad'", f"CREATE TABLE {other}.forbidden(id int)"]:
        result = subprocess.run(["docker", "compose", "exec", "-T", "postgres", "psql", "-U", "postgres", "-d", "edutech", "-v", "ON_ERROR_STOP=1", "-c", f"SET ROLE {role}; {sql}"], capture_output=True, text=True)
        assert result.returncode != 0 and "permission denied" in result.stderr, result
run("exec", "-T", "ai-service", "python", "-c", "import os,urllib.request,json; r=urllib.request.Request('http://localhost:8000/internal/v1/health/ready',headers={'X-Service-Token':os.environ['AI_SERVICE_TOKEN']}); assert json.load(urllib.request.urlopen(r)) == {'status':'up'}")
assert '"event": "heartbeat"' in run("logs", "ai-worker")
print("PASS: four processes, health, pgvector, independent migrations, seeds and cross-schema denial")
