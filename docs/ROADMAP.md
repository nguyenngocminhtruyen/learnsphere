# Implementation Roadmap with Acceptance Criteria

**Cadence:** phase gates, not fixed delivery promises. Indicative 16+ weeks for one developer using Codex, subject to available hours, QA, AWS access and document-processing quality. No AI agent may declare a phase done without running verification.

## Definition of Done (every phase)
- Typecheck, lint, unit tests, feature integration tests, database migrations and a documented manual smoke check pass.
- Permission tests cover all new protected routes and negative cases.
- API contracts/OpenAPI and README updated; logs are structured and redact secrets.
- User-facing UI has EN/VI strings, loading/empty/error states and keyboard interaction.
- PR links to requirement IDs, acceptance test evidence and architectural decisions where needed.
- No feature hidden behind mock data is described as complete; network calls persist real state in test environment.

## Phase 0: Architecture & repository foundation (Week 1)
**Scope:** polyglot monorepo: apps/web (Next.js), apps/api (Spring Boot), apps/ai-service (FastAPI), apps/ai-worker (Python), contracts/openapi; local Postgres+pgvector, test stack; CI, formatting, env validation, ADRs, health checks, IaC skeleton.
**Tickets:** P0-01 mono workspace; P0-02 OpenAPI public/internal contracts and client codegen; P0-03 Docker Compose and migrations; P0-04 CI; P0-05 CDK starter+environment isolation; P0-06 observability baseline.
**Acceptance criteria:**
- [ ] `pnpm --dir apps/web install --frozen-lockfile`, `pnpm --dir apps/web lint`, `pnpm --dir apps/web typecheck`, `pnpm --dir apps/web build`, `./gradlew test` in apps/api, and `ruff check .`, `mypy .`, `pytest` in Python projects pass from fresh checkout.
- [ ] `docker compose up -d` starts local PostgreSQL and pgvector migration succeeds; demo DB seeded deterministically.
- [ ] API `/health/live` and `/health/ready` return expected statuses; AI service and Python worker start with LocalStack/test adapter without AWS credentials.
- [ ] CI fails on deliberate frontend TS, Java compilation, Python type or unit-test error; secrets are not committed.
- [ ] CDK synth completes for dev/prod configs; documented AWS account, region and costs to review prior to deployment.

## Phase 1: Identity, RBAC & bilingual foundation (Weeks 2–3)
**Scope:** Cognito integration, backend JWT verification, internal user sync/roles, Next.js locale routing, student/admin shells, security audit events.
**Tickets:** P1-01 Cognito env integration; P1-02 Spring Security resource-server JWT authentication; P1-03 method-level and service-level RBAC policies; P1-04 localized UI navigation; P1-05 profile settings; P1-06 auth/e2e matrix.
**Acceptance criteria:**
- [ ] Valid Cognito token permits `/me`; expired/foreign issuer/wrong audience tokens fail 401.
- [ ] STUDENT gets 403 on admin mutation, EDITOR cannot publish without explicit permission.
- [ ] Locale switch changes UI in both directions; fallback is tested for missing keys.
- [ ] Logout/session expiry returns user to non-protected screen; API never trusts role from client payload.
- [ ] Audit log records sensitive role changes without token or sensitive payload exposure.

## Phase 2: CMS / Course Builder & catalog (Weeks 4–5)
**Scope:** draft course CRUD, localized metadata, module/lesson order, asset links, publish validation/versioning, public catalog.
**Tickets:** P2-01 course/version schema; P2-02 admin editor CRUD; P2-03 module/lesson editor; P2-04 draft revision conflict; P2-05 publish workflow; P2-06 catalog/search SEO.
**Acceptance criteria:**
- [ ] Admin builds course with 2 modules and 3 lessons, edits order, reloads page and sees persisted structure.
- [ ] Draft not visible publicly; PUBLISHED appears in catalog by EN/VI URL and metadata.
- [ ] Publish fails with comprehensible errors if title/module/lesson/asset prerequisites unmet.
- [ ] Editing a published course creates a new draft; original published version remains unchanged.
- [ ] Concurrent stale draft save returns conflict instead of silently overwriting changes.

## Phase 3: Student learning, progress & quiz (Weeks 6–7)
**Scope:** enrollment, protected player, progress, quiz engine, learning dashboard.
**Tickets:** P3-01 enrollments and eligibility; P3-02 lesson player; P3-03 progress APIs; P3-04 quiz/question authoring; P3-05 quiz attempts/scoring; P3-06 student dashboard.
**Acceptance criteria:**
- [ ] Student can enroll exactly once, navigate only courses they can access and retain completion after relogin.
- [ ] Unenrolled user receives 403/404 for private lesson and resource; guessed IDs do not work.
- [ ] Quiz GET has no correct answers, scoring is server-side and results are repeatable.
- [ ] Completing one of four required lessons shows 25% progress; repeat calls do not increment it.
- [ ] Admin can view aggregated enrollments and completion counts without exposing student private data publicly.

## Phase 4: Documents & ingestion (Weeks 8–9)
**Scope:** S3 presigned uploads, scan gate, document parsing, provenance, SQS worker, chunking/embedding in pgvector, admin job screen.
**Tickets:** P4-01 document lifecycle; P4-02 upload intent/finalize; P4-03 file security validation; P4-04 Python text extraction adapters; P4-05 chunk+embed; P4-06 idempotent workers/DLQ; P4-07 retry/reindex UI.
**Acceptance criteria:**
- [ ] Authorized Admin uploads representative PDF/DOCX/PPTX and sees READY with page/slide source mapping.
- [ ] Empty, oversized, spoofed MIME, malformed or prohibited files fail with safe reason.
- [ ] Retried ingestion does not produce duplicate active chunks; poison job ends in DLQ.
- [ ] Reindex produces new document version; changing embedding model never mixes incompatible vector dimensions.
- [ ] Revoked file is immediately excluded from any retrieval query before asynchronous deletion.

## Phase 5: AI Course Generator (Weeks 10–12)
**Scope:** outline → lesson → quiz drafts; schema validation, source provenance, per-artifact regeneration, admin review/approval, token usage.
**Tickets:** P5-01 Python Bedrock gateway and contract tests; P5-02 outline schema/prompts; P5-03 lesson generator; P5-04 quiz generator; P5-05 provenance/quality checks; P5-06 review UI; P5-07 safe publish integration.
**Acceptance criteria:**
- [ ] Given seeded valid source document(s), AI creates parseable structured outline with >=2 modules and explicit objectives.
- [ ] Admin can edit outline, approve, regenerate only one lesson without replacing previously approved lessons.
- [ ] Generated MCQ has valid options, correct-answer references, explanation, provenance and duplicate detection.
- [ ] Invalid schema, Bedrock timeout or inadequate evidence results in FAILED/NEEDS_REVIEW, never auto-publish.
- [ ] Published lesson and quiz originate from explicitly reviewed artifacts; audit trail includes reviewer, model and source versions.
- [ ] Usage limits and retry/cancel behavior can be exercised in staging and no duplicate charges from unbounded retries.

## Phase 6: Course-scoped RAG Tutor (Weeks 13–14)
**Scope:** retrieval, streaming chat, citations, no-evidence behavior, feedback, evaluation dataset and abuse limits.
**Tickets:** P6-01 access-scoped retrieval; P6-02 query embeddings and hybrid search baseline; P6-03 Java SSE proxy + private FastAPI stream; P6-04 citation validator; P6-05 rating/history; P6-06 evaluation harness; P6-07 cost controls.
**Acceptance criteria:**
- [ ] Student can ask in enrolled course, receive a streamed answer citing accessible lesson/document/page.
- [ ] Cross-course, revoked, draft and unapproved chunks cannot appear in prompt context nor citations (automated adversarial tests).
- [ ] Unsupported question leads to a useful uncertainty/insufficient-evidence answer without invented sources.
- [ ] Every returned citation ID matches an authorized retrieved chunk; direct source links re-check permissions.
- [ ] Feedback persists and user cannot access another student's conversation IDs.
- [ ] Evaluation fixture of >=40 multilingual technology questions includes answerable, unanswerable, misleading and adversarial questions; publish measured accuracy and latency baseline with review rubric rather than declaring unspecified quality.

## Phase 7: AWS staging, hardening & Public Beta (Weeks 15–16+)
**Scope:** CDK provisioning, CI/CD, secure asset delivery, backups, metrics, concurrency/abuse tests, accessibility, legal content policy, operational runbook.
**Tickets:** P7-01 AWS isolated accounts/env; P7-02 CloudFront/WAF/OAC and private media; P7-03 ECS web/Java API/private AI service/Python worker deployments, ALB/RDS; P7-04 secrets/network/IAM review; P7-05 monitoring/alarms/budget; P7-06 load/restore/security drills; P7-07 beta checklist.
**Acceptance criteria:**
- [ ] Entire user story works end-to-end in staging using actual managed AWS services.
- [ ] CloudFront private asset tests: enrolled authorized access succeeds, anonymous and expired signed URL attempts fail.
- [ ] No publicly addressable DB; ECS task IAM limited to needed S3/SQS/Bedrock resources.
- [ ] RDS backup restore performed in staging with documented RPO/RTO observation.
- [ ] Baseline load test and AI usage-cost report published with p50/p95, errors and estimated monthly spend.
- [ ] Security checklist passes IDOR, JWT, upload abuse, leaked answer keys, prompt injection and cross-course retrieval scenarios.
- [ ] Admin moderation, takedown request handling, policies/terms/privacy and consent checklist reviewed before inviting public users.
- [ ] Rollback/smoke procedure and responsible on-call contacts are documented.

## Dependency and ordering
`P0 → P1 → P2 → P3`; `P2 → P4 → P5`; `P3 + P4 → P6`; all previous phases → P7. It is valid to build initial AWS IaC incrementally while coding, but public launch gates are non-negotiable.

## MVP freeze criteria
STOP adding scope when Admin-to-Student-to-RAG happy path works with release safety gates. No payments, instructor marketplace, AI coding interpreter, translated media/video generation, autonomous publishing or auto-created certifications. Capture ideas in backlog, do not expand current milestones.

## Suggested first Codex task
"Read docs/PRD.md, docs/ARCHITECTURE.md, docs/DATABASE_ERD.md, docs/ROADMAP.md and AGENTS.md. Implement ONLY Phase 0 foundation with a running Next.js UI, Java 21 Spring Boot health API, private Python FastAPI health service and Python worker stub, Docker PostgreSQL+pgvector and LocalStack, versioned OpenAPI contracts, Gradle/pytest/Ruff/frontend verification and CI. Run the documented commands, report tests and any deviations. Do not implement AI, enrollment or CMS yet."

## Polyglot acceptance gates (apply to all relevant phases)
- [ ] Public and internal OpenAPI contracts are checked into git; generated Java/Python clients compile and contract tests fail on breaking changes.
- [ ] No student-facing request directly reaches Python; Java enforces enrollment and Python independently enforces source scopes.
- [ ] Separate Flyway (`lms`) and Alembic (`ai`) migration histories apply cleanly from an empty database; app DB users cannot write the other domain's tables.
- [ ] `POST /v1/tutor/...` disconnect cancels upstream Python generation, respects timeouts and does not leak scopes into logs.
- [ ] Replayed SQS job or duplicate outbox dispatch does not create duplicate documents, chunks or AI artifacts.

## Phase 0 implementation ordering (Java + Python)
1. P0-01 repo structure, Java 21 toolchain, Python 3.12, pnpm.
2. P0-02 versioned OpenAPI external/internal contracts, problem+json errors.
3. P0-03 local compose for Postgres+pgvector and LocalStack; two least-privilege DB roles/schemas.
4. P0-04 Spring Boot `/health/live` and `/health/ready`, baseline migration via Flyway.
5. P0-05 FastAPI private `/internal/v1/health/ready`, Pydantic schemas, Alembic baseline and worker stub.
6. P0-06 build/test scripts for Gradle, pnpm, Ruff/mypy/pytest and shared smoke tests.
7. P0-07 CDK skeleton: ECS services and SQS/DLQ with no deployment required locally.
8. P0-08 CI enforcing all three toolchains and OpenAPI compatibility.

**Phase 0 exit criteria:** all four processes boot locally (web, Java API, Python AI service, Python worker); clean DB migrations succeed; `curl` health checks work; Java cannot mutate `ai` tables and Python cannot mutate `lms` tables; no AWS account required for local tests.

## Phase UI-01: LearnSphere frontend demo (separately authorized milestone)

**UI-01-Vercel: Prepare customer-facing frontend preview.** Preserve the existing UI and isolated fixture data; verify a production build and navigation without backends; document Vercel root, toolchains, environment and deployment checks. No public deployment or later-phase implementation is included. See [preview deployment guide](VERCEL_PREVIEW.md).

UI-only exploration after Phase 0: public discovery/catalog/course pages, student learning/player/quiz flow, demo access forms, creator dashboard/editor and AI Studio review wizard. Uses typed fixtures, in-memory state, original assets and EN/VI UI. It adds no production authentication, enrollment, publishing, ingestion, model calls or backend integration from Phases 1–7. See [UI01 implementation and evidence](UI01.md) for route scope, acceptance checks and limitations. Existing backend phase gates remain unchanged.
