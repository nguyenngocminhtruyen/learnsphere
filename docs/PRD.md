# Product Requirements Document (PRD) v1.0

**Product:** AI Learning Platform  
**Date:** 2026-10-26  
**Status:** Proposal ready for MVP implementation  
**Audience:** Product owner, engineer, designer, QA, Codex agents.

## 1. Product vision
A public Vietnamese/English learning platform for technology, programming and AI. Students discover courses, enroll, consume lessons, complete quizzes, track progress and ask an evidence-grounded AI tutor. Admins upload owned/licensed source documents; AI proposes structured courses/lessons/quizzes; humans edit and approve before publication.

## 2. Personas
- Visitor: browse SEO-friendly public course catalog and localized metadata.
- Student: register, enroll, study, complete quizzes, get grounded help, inspect learning history.
- Admin: manage users/courses and publishing; upload, validate, approve/reject/retry AI artifacts; review usage and failure states.
- Content editor (role in schema, optionally admin-only UI for v1): draft and review courses without user/system admin powers.

## 3. Goals and non-goals
### MVP goals
- End-to-end public course delivery for free courses with manual and AI-assisted content creation.
- Grounded, course-scoped AI Q&A with verifiable citations.
- Secure authorization boundaries and auditable publish operations.
- Vietnamese/English UI, bilingual metadata and search-ready catalog.
- AWS deployment with reproducible infrastructure and operational alerts.

### Explicitly out of MVP
Payments, subscriptions, marketplace, external instructor onboarding, native mobile apps, course recommendation ML, livestreaming, auto-translation of full courses, AI video generation, autonomous course publishing, graded programming sandboxes, certificates, personalized planning agents and full multi-tenant organizations.

## 4. Functional requirements (priority)
### Identity, roles, public content
- FR-001 P0: Visitors can see only PUBLISHED/PUBLIC course versions and localized catalog metadata.
- FR-002 P0: Students can sign up/sign in and sign out using Cognito; API validates issuer/audience/signatures and maps Cognito `sub` to internal user.
- FR-003 P0: Role policies distinguish ADMIN, EDITOR, STUDENT; mutations authorized in API, not just UI.
- FR-004 P0: VI/EN switch persists user preference; fallback locale is explicit.
- FR-005 P1: Search/filter public courses by keyword, topic, locale and difficulty.

### LMS and assessment
- FR-010 P0: Admin CRUD draft courses, modules, lessons and source links with stable order positions.
- FR-011 P0: Course drafts and published snapshots are versioned; changes after publish don't silently mutate an active version.
- FR-012 P0: Students enroll once per course; active enrollment gates private lesson, quiz and RAG access.
- FR-013 P0: Lesson supports rich text/Markdown, links and protected file/video resources; learner can mark completed.
- FR-014 P0: Server-authoritative lesson progress and derived completion percentage; idempotent completion updates.
- FR-015 P0: Single/multiple choice quizzes, answer validation, attempt recording, results and explanations. Correct answers not exposed before submission.
- FR-016 P1: Admin views basic enrollments, completion and quiz-attempt counts; no extensive BI in MVP.

### Documents and AI Content Studio
- FR-020 P0: Admin uploads whitelisted PDF, DOCX, PPTX, Markdown files through bounded presigned upload; backend verifies ownership, mime/signature, checksum/size, scan status and storage key.
- FR-021 P0: Job pipeline parses/extracts text, detects unsupported/empty files, records page/slide/section provenance and job state.
- FR-022 P0: AI drafts curriculum (title, objectives, modules, ordered lesson outlines); schema validation and source coverage required.
- FR-023 P0: Admin reviews/edits curriculum before requesting per-lesson generation.
- FR-024 P0: AI creates individual lesson drafts with source references; invalid/unsubstantiated drafts cannot auto-publish.
- FR-025 P0: AI generates MCQ drafts (question, options, correct answer, rationale, linked source) and flags invalid/duplicate questions.
- FR-026 P0: All outputs persist as DRAFT; Admin may approve, reject, edit and selectively regenerate. Publish requires explicit action and validation.
- FR-027 P0: Each generation action has job status QUEUED/RUNNING/SUCCEEDED/FAILED/CANCELED, input fingerprint, prompt/model version, usage/cost estimate, retry action and admin-visible error.
- FR-028 P1: Course generation supports selected input documents, target VI/EN language, learning level and approximate module count.

### AI Tutor
- FR-030 P0: Students ask questions only in an enrolled course; context defaults to the current lesson with optional broader course retrieval.
- FR-031 P0: Retrieval filters only READY chunks tied to authorized, published content; access rechecked before rendering citations.
- FR-032 P0: Answers cite document/lesson/page or section; nonexistent citations disallowed by server-side validation.
- FR-033 P0: If documents lack evidence, AI acknowledges uncertainty rather than fabricating facts; prompts treat retrieved documents as untrusted context.
- FR-034 P0: Conversation scoped to user and course; history accessible only to its owner/admin under explicit policy; SSE streaming with cancellation.
- FR-035 P0: Student can rate helpful/not helpful; admin sees anonymous aggregate quality and usage metrics.
- FR-036 P1: AI can propose optional practice questions, not overwrite graded official quiz records.

## 5. Main user stories
1. As Admin, I upload a PDF and get a parsed/failed status with evidence of what was extracted.
2. As Admin, I ask AI for an intermediate Vietnamese AI course, review its outline, regenerate Lesson 2 only, verify citations and publish a version.
3. As Student, I enroll in a free course, open Lesson 1, mark it complete, and see persisted progress after relogin.
4. As Student, I complete a quiz and receive a result computed by backend.
5. As Student, I ask AI a question during Lesson 2 and follow citations to accessible source sections.
6. As an unauthorized user, I cannot read an enrolled-only lesson or a private source document by guessing IDs/URLs.

## 6. UX / page inventory
- Public: `/`, `/courses`, `/courses/[slug]`, `/login`, `/register`.
- Student: `/my-learning`, `/learn/[courseId]/[lessonId]`, `/profile`, course quiz pages.
- Admin: `/admin`, `/admin/courses`, `/admin/courses/[id]/builder`, `/admin/ai-studio/jobs/[id]`, `/admin/documents`, `/admin/users`.
- Course builder states: empty, manually edited draft, AI proposed outline, reviewing, publish validation errors, publishing, published.
- AI chat states: loading/streaming, empty retrieval, source citation, model error, budget limit, access denied.

## 7. Nonfunctional requirements and preliminary service-level targets
- NFR-001: No unauthenticated access to enrolled-only contents; direct object URLs are non-public and expiring.
- NFR-002: API endpoints have input validation, pagination, RBAC, abuse throttling and audit logging for sensitive writes.
- NFR-003: Accessibility target WCAG 2.2 AA for major flows; keyboard navigation and captions/transcripts where media exists.
- NFR-004: Public catalog target p95 API latency <500 ms with representative seeded dataset, excluding cold starts/upstream calls; target, not guarantee.
- NFR-005: AI Q&A target first streamed text within 5 sec at p95 in controlled performance tests when model is healthy; measure rather than promise.
- NFR-006: AI jobs are idempotent, bounded, retryable with DLQ and observable status transitions.
- NFR-007: Production automated backups and tested restoration; plan RPO <=24h and RTO <=8h as initial acceptance targets, refine before paid launch.
- NFR-008: Store minimal PII; explicit retention and deletion policy; redact prompts/logs; encrypt in transit and at rest.
- NFR-009: Track model ID, prompt template version, token usage, failures and latency; alarm on abnormal spending.
- NFR-010: All API schema changes versioned with migration tests, and public deployment supports rollback.

## 8. Critical business rules
- All courses in MVP are FREE; fields anticipate paid entitlements, but no checkout routes.
- Only ADMIN/EDITOR can create drafts; only ADMIN (or explicit publisher permission) can publish.
- Course release generates immutable published snapshot. Existing enrollment points to assigned version or explicit migration rule.
- Documents have visibility/rights status; unpublished or unauthorized sources never appear in RAG.
- Content generated by AI is never automatically published; quiz explanations and answers require review.
- Deleting a source triggers logical revocation immediately and async removal of its embeddings/index artifacts.
- VI/EN UI strings are separate from course content translations.

## 9. KPIs and instrumentation
- Catalog view → registration → enrollment conversion; enrollment → first lesson; lesson and course completion.
- Admin: upload success ratio; outline edit rate; published courses; time per reviewed course.
- AI: ingestion success, generation acceptance/rejection rate, grounded answer/citation accuracy sampled by humans, abstention rate, helpful vote ratio, token cost per published lesson and Q&A session.
- Safety: unauthorized request blocks, citation permission tests, document ingestion failures, daily AI budget breaches.

## 10. Risks and mitigations
- Hallucinated course material: source tracing, structured validation, human editorial approval.
- Unauthorized RAG leakage: backend ACL filters before search, source revalidation, integration tests for cross-course queries.
- High AWS fixed cost: keep nonproduction resources ephemeral; capacity/budget alarms; choose service sizes after costing.
- Harmful document prompt injection: documents treated as data, not system instructions; forbid tool execution from context.
- Copyright: require upload attestation and removal process; launch terms/privacy review.
- Bilingual drift: translation keys tests and explicit content-language metadata.
- Video complexity: use safe provider playback or pre-encoded protected files; no complex media pipeline until validated demand.

## 11. MVP release definition
A complete flow is demonstrated with a source document uploaded by Admin, a reviewed AI-generated course published, a student enrolled and progressing through a lesson/quiz, and a course-scoped RAG answer with authorized citations. Automated tests, audited authorization and recovery procedures pass in staging. See ROADMAP.md for phase gates.


## Technology implementation decision (v1.1)
The public/product requirements are unchanged. The approved delivery stack is **Next.js + Java Spring Boot LMS API + Python FastAPI AI service + Python worker**, deployed to AWS. Java owns transactional LMS and authorization; Python owns AI generation, document processing and RAG with explicit permission checks. This technology change does not expand the MVP scope.
