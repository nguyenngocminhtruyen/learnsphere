# Codex Development Guide (Option A, Java + Python)

## Repository layout
```text
apps/
  web/                  # Next.js (TypeScript, i18n, admin/student/public)
  api/                  # Java 21, Spring Boot 3.x, Spring Security, Spring Data JPA, Flyway, Gradle
  ai-service/           # Python 3.12, FastAPI, Pydantic, SQLAlchemy2, Alembic, streaming RAG
  ai-worker/            # Python 3.12 SQS consumers for ingestion and course generation
contracts/
  openapi/              # lms-public.yaml and ai-internal.yaml, versioned
infra/
  cdk/                  # AWS CDK TypeScript IaC
docs/
  PRD.md ARCHITECTURE.md DATABASE_ERD.md ROADMAP.md CODEX_GUIDE.md
compose.yaml            # PostgreSQL+pgvector and local SQS adapter (LocalStack)
AGENTS.md
```

## Engineering agreements
- Frontend uses strict TS; no direct Python/browser connections.
- Java enforces Cognito JWT issuer, audience, signature, RBAC, enrollment and course version. Use Bean Validation, problem+json responses, Spring security tests and Testcontainers for DB tests.
- Java publishes SQS jobs only after DB commit through transactional outbox; apply optimistic locking/version checks.
- Python uses Pydantic v2, SQLAlchemy 2, Alembic, Ruff, mypy and pytest. It validates Java-issued short-lived scopes and re-checks document ACL in retrieval SQL; keep internal service private.
- Never mix Flyway and Alembic on the same tables. Store and version all model/index metadata.
- OpenAPI is shared contract; Java/Python generated clients compile and contract tests run. Avoid serializing ORM models directly.
- Use AWS SDK for Java v2 in API and boto3 in Python; use explicit region, model IDs and budgets, never guess account availability.
- All uploaded content/model output is untrusted; no automatic AI publication. Sensitive source text and auth claims never go into logs.

## Phase 0 target commands
These are **expected commands after scaffolding**, not a claim that the app exists yet.
```bash
docker compose up -d
cd apps/web && pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd ../api && ./gradlew clean test bootJar
cd ../ai-service && python -m pip install -e '.[dev]' && ruff check . && mypy . && pytest
cd ../ai-worker && python -m pip install -e '.[dev]' && ruff check . && mypy . && pytest
```
For the local environment use a single consistent `make verify` (or scripts equivalent) and document exact commands.

## First 10 implementation tickets
1. P0-01 Configure repository and toolchains: pnpm, Java 21 Gradle wrapper, Python 3.12.
2. P0-02 Bootstrap Next.js i18n shell and health route.
3. P0-03 Bootstrap Spring Boot with Spring Security + Actuator live/ready.
4. P0-04 Bootstrap FastAPI private health and Pydantic error contract.
5. P0-05 Bootstrap Python AI worker with idempotent job interface.
6. P0-06 Compose PostgreSQL pgvector + LocalStack, least-privilege roles.
7. P0-07 Flyway and Alembic independent baseline migrations.
8. P0-08 Versioned OpenAPI public/internal contracts and generation tests.
9. P0-09 CI checks Java/Python/TypeScript, integration tests and contract diff.
10. P0-10 AWS CDK synth for ECS web/Java/FastAPI/worker, RDS/S3/SQS and secrets skeleton.

## Copy/paste starter Codex prompt
```text
Read AGENTS.md and docs/{PRD,ARCHITECTURE,DATABASE_ERD,ROADMAP,CODEX_GUIDE}.md.
Implement ONLY Phase 0, following Option A: Next.js TypeScript, Java 21 Spring Boot LMS API, Python 3.12 FastAPI internal AI service and Python SQS worker.
Use separate lms/Flyway and ai/Alembic Postgres schemas, OpenAPI public/internal contracts and Docker local stack.
Do not implement course business logic, AI generation or RAG in Phase 0.
Run all available frontend, Gradle, Python and Docker verification commands.
Report exact outputs, failed checks and remaining tasks. Do not claim successful deployment.
```

## Review prompt
`Compare completed work to Phase N acceptance criteria, identify missing negative security tests, report commands actually run, and list outstanding risks.`
