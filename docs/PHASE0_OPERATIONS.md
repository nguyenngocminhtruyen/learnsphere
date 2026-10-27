# Phase 0 local operations

Scope: P0 repository foundation only. No auth flow, CMS, enrollment, document ingestion, tutor or Bedrock invocation is implemented. ADR-001 through ADR-007 remain unchanged.

Use Node 22, pnpm 10.20.0, JDK 21, Python 3.12, Docker Compose v2+, Maven (generated client compilation) and an internet connection for initial dependency/image downloads. Install Python tools in a virtualenv:

```sh
python3.12 -m venv .venv
. .venv/bin/activate
pip install -e 'apps/ai-service[dev]' -e 'apps/ai-worker[dev]'
pnpm --dir contracts install --frozen-lockfile
pnpm --dir infra/cdk install --frozen-lockfile
make verify
docker compose up -d
make smoke
curl -f http://localhost:8080/health/live
curl -f http://localhost:8080/health/ready
```

The API commits `apps/api/gradle/gradle-daemon-jvm.properties` to select an Eclipse Temurin Java 21 **JDK** for Gradle itself, as well as the Java 21 compiler toolchain in `build.gradle`. This prevents `Unsupported class file major version 69` when the shell's default Java is 25. A Java 21 JRE alone does not include the required compiler. Gradle reuses a matching installed JDK or downloads one using the committed provisioning URLs and caches it under `GRADLE_USER_HOME` (normally `~/.gradle`). Initial provisioning needs internet access. The generated wrapper scripts are unchanged; run `cd apps/api && ./gradlew clean test bootJar` normally. No machine-specific Java path is committed.

For an offline setup, install a complete Temurin 21 JDK in a standard location before building. Use `./gradlew --version` to inspect the launcher and daemon criteria. Refresh provisioning URLs when updating JDK patches with `./gradlew updateDaemonJvm --jvm-version=21 --jvm-vendor=adoptium`. CI also builds the API with a Java 25 launcher to catch this regression.

If default ports are occupied, use `API_PORT=18080 WEB_PORT=13000 docker compose up -d` and the same environment values for `make smoke`.

Open http://localhost:3000 for the bilingual foundation page. Python has no published host port. Its health probes require a service token even on the internal network. The local static token is strictly a Phase 0 health-probe credential; signed per-user scopes belong to later authorization work. Unknown Java routes are denied. No browser request calls Python.

Compose supplies conspicuously local-only DB passwords and LocalStack dummy AWS credentials; no AWS account is needed. Host ports bind loopback. Never reuse these credentials outside local development. Native Java startup requires all LMS_DATABASE_* and LMS_MIGRATION_* values from compose; AI requires AI_DATABASE_URL and a >=32-character AI_SERVICE_TOKEN. Alembic requires AI_MIGRATION_DATABASE_URL. Worker defaults to deterministic test adapter; SQS mode requires queue URL and configured AWS credential chain. No source content or credentials are logged.

Postgres init provisions vector, separate schema owners/migration roles and runtime roles. Flyway and Alembic each create one deterministic `foundation` row and their own history. Runtime roles have only schema usage and table DML in their domain; no ownership or cross-schema grants. The bootstrap superuser is only for local provisioning/test assertions. Init runs once per empty volume. To intentionally reset local data, run `docker compose down -v` then `docker compose up -d`. This deletes local data. Apply future migrations forward; restore backups rather than editing applied migrations.

The worker is a queue connectivity/heartbeat stub. It does not receive, delete or execute domain messages; idempotent ingestion and outbox processing belong to Phase 4. LocalStack provisions the queue and a DLQ with maxReceiveCount=3.

Health readiness uses bounded DB connection/query timeouts and reports 503 without internal error details. Logs are structured JSON in Java and Python. The smoke script proves health, seed availability, vector installation, separate histories and positive/negative DB write permissions. CI checks source contracts against the PR base and compiles generated Java/Python clients. Current contracts expose health only; future routes must be added with their implementation phase.

## Infrastructure review before deployment

`pnpm --dir infra/cdk synth:dev` and `synth:prod` produce distinct stack IDs and environment tags without AWS credentials or context lookups. This is an intentionally undeployable application skeleton: ECS desired counts are zero with explicit placeholder images, isolated subnets have no egress, and no public ingress or application secrets wiring is provided. Do not treat synth as production readiness.

Before Phase 7, record actual dev/prod AWS account IDs, approved region, separate secrets and deployment OIDC roles; verify RDS pgvector support. Review costs for RDS (prod Multi-AZ), storage/backups, Fargate, ALB, NAT versus endpoints, CloudFront/WAF, logs, S3/SQS and Bedrock quotas with AWS Pricing Calculator. No account/region/model selection or dollar estimate is invented here. No deployment is performed by Phase 0 CI.

CI invokes TS compilation, Gradle compilation/tests and strict Python typing/tests without continue-on-error; any failure blocks the job. Deliberate-error gate verification and hosted CI execution must be separately evidenced. The deliberate-error fixtures in `scripts/check_ci_gates.py` prove that TypeScript, Java compilation, Python types and pytest failures block CI. Run dependency/security audits before deployment; the skeleton makes no production security claim.
