# AI Learning Platform - Blueprint v1.0

Date: 2026-10-26. Status: Phase 0 foundation implemented; verification evidence is recorded separately. Not deployed software.

## Product
Public bilingual (Vietnamese/English) technology, programming and AI course platform, with admin-reviewed AI course generation and permission-aware RAG tutor.

## Architecture decision summary
- Polyglot repository: `apps/web` Next.js (TypeScript), `apps/api` Java 21 Spring Boot (LMS), `apps/ai-service` Python 3.12 FastAPI (RAG/tutor), `apps/ai-worker` Python 3.12 (SQS processing), `contracts/openapi` shared interface specifications. Java Flyway (`lms` schema); Python Alembic (`ai` schema).
- Production: AWS CloudFront, WAF, ECS/Fargate (web/Java API/FastAPI AI/worker), ALB, RDS PostgreSQL with pgvector after extension compatibility verification, S3, SQS+DLQ, Cognito, Bedrock, Secrets Manager, CloudWatch, ECR.
- Infrastructure-as-code: AWS CDK (TypeScript). Deploy dev and prod with isolated resources and separate secrets.
- Video in MVP: external/unlisted provider integration or S3+CloudFront signed delivery for small, pre-encoded files; no transcoding pipeline in v1. Never publicize private course assets.
- Human approval is required to publish AI-generated content. Model output is untrusted and validated.
- RAG authorization enforced server-side *before retrieval* and on cited document access.

## Documents
1. [PRD](docs/PRD.md)
2. [System Architecture](docs/ARCHITECTURE.md)
3. [Database ERD and schema specification](docs/DATABASE_ERD.md)
4. [Implementation roadmap and acceptance criteria](docs/ROADMAP.md)
5. [Codex execution guide](docs/CODEX_GUIDE.md)

## Get started with Codex
1. Read `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE_ERD.md`, `docs/ROADMAP.md`.
2. Implement **only Phase 0**, with tests. Do not scaffold all phases at once.
3. Follow `AGENTS.md` for conventions and verification gates.
4. Stop at each phase gate until its acceptance criteria are met.

## Unresolved product decisions
- Auth experience: Cognito managed sign-in vs customized Cognito flow. Default: Cognito hosted/managed with backend JWT verification.
- Course video hosting provider/encoding model. Default: provider-hosted playback or pre-encoded video; no AWS transcoding in MVP.
- Content licensing, terms/privacy and local regulatory review before public launch.
- Bedrock model availability, quota and region for chosen AWS account. Choose configured model IDs per environment, never hard-code a presumed universal model.

No cloud prices or timeline are guaranteed. Obtain AWS Pricing Calculator estimates based on the deployment region, baseline Fargate capacity, ALB, NAT/egress, RDS, S3/CloudFront and expected Bedrock tokens.

## Phase 0 local setup

See [local operations](docs/PHASE0_OPERATIONS.md) for toolchains, `make verify`, Docker startup and health smoke checks. See [verification evidence](docs/PHASE0_EVIDENCE.md) for executed checks and remaining acceptance gaps. Later phases are not implemented.

## LearnSphere UI demo — Phase UI-01

Run `pnpm --dir apps/web dev --port 3100` and open http://localhost:3100. Explore the catalog, simulated learning and quiz flow, creator editor and AI Studio without starting backend services. All operations use local mock state; only language preference persists. See [UI-01 scope, commands, acceptance evidence and limitations](docs/UI01.md).

For the frontend-only Vercel customer preview, see [deployment settings and verification](docs/VERCEL_PREVIEW.md). This preview does not deploy the backend or replace the AWS production architecture.
