# Service Boundaries & Data Ownership

| Operation | Java API | Python AI service/worker |
|---|---|---|
| Cognito JWT verification | Owner | Reject direct browser callers; verify signed internal claims |
| Course CRUD / publish | Owner | Generate drafts only; no publish permission |
| Enrollment / progress / quiz scoring | Owner | No writes |
| Upload intent / asset entitlement | Owner | Validate uploaded artifact, extract/index async |
| AI Course Generation | Create authorized request + persist job intent/outbox | Generate structured artifacts + provenance; return state |
| Tutor Q&A | Authenticate, authorize, proxy SSE, persist ownership | Re-validate scope, RAG, Bedrock, citations/usage |
| DB migrations | Flyway in `lms` | Alembic in `ai` |

## Security invariants
1. Browser never accesses `/internal/v1` and never receives Python service credential.
2. All Python requests include authenticated service identity and short-lived signed scope claims, including purpose, courseVersionId, userId and expiry.
3. Cross-course leakage prevented by SQL constraints as well as Java enrollment check; citations filtered against authorized chunk IDs.
4. Revoke/depublish must invalidate access immediately even before chunk deletion finishes.
5. Job input only IDs and versions. SQS is at-least-once; worker deduplicates effects using job id and version.
6. Use per-service DB roles; no arbitrary SQL writes across `lms`/`ai`.

## Open issues / decisions before implementation
- Bedrock model IDs, embeddings dimensionality, capacity and region must be selected against actual AWS account and supported services.
- Verify pgvector extension availability for chosen Amazon RDS PostgreSQL engine version before production migration.
- Agree on service-identity implementation (e.g., private network + validated short-lived signed claims; private network alone is insufficient).
- Agree on exact document ACL projection/read-only DB privilege and cross-schema migration order.
- Determine how private video is hosted; no MediaConvert pipeline in MVP by default.
