# Coding agent guardrails (Option A, v1.1)
Read README.md, docs/PRD.md, docs/ARCHITECTURE.md, docs/DATABASE_ERD.md, docs/ROADMAP.md and docs/CODEX_GUIDE.md before editing.

1. Implement exactly one named roadmap ticket/phase per request; propose ADR for any change of architecture.
2. Stack is fixed: Next.js TypeScript frontend, Java 21 Spring Boot LMS API, Python 3.12 FastAPI AI service, separate Python SQS worker, AWS PostgreSQL, S3, SQS, Cognito and Bedrock. **Do not scaffold NestJS, Prisma, or BullMQ.**
3. Java owns authentication, RBAC, enrollment, course publishing and quizzes. Python owns document parsing, embedding, RAG, tutor and generation. Browser calls Java only.
4. Keep `contracts/openapi/*.yaml` authoritative; run OpenAPI breaking-change and Java/Python contract tests.
5. Flyway owns `lms` schema, Alembic owns `ai` schema. No cross-schema writes by app roles.
6. Security checks always in Java and again in Python's retrieval constraints. Never use frontend authorization alone or trust unvalidated user identifiers in internal requests.
7. LLM output and uploaded documents are untrusted. No automatic publication, no cross-course retrieval, no invented citations; validate schemas and store source provenance.
8. Include EN and VI translation keys for all student/admin-facing UI labels, and include tests for unauthorized/negative paths.
9. Local setup must work without AWS credentials using Docker + LocalStack or deterministic mocks.
10. Report changed files, test commands actually executed and results, remaining risks, uncompleted acceptance checks. Never claim tests or deployment succeeded when they were not run.
