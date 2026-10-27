# ADR-008 proposal: Vercel for the UI-01 customer preview

Status: Proposed for this explicitly requested frontend preview only (2026-10-27).

ADR-007 selects ECS/Fargate for the integrated production application. The customer needs an HTTPS preview of the existing UI before backend phases are implemented.

Use a separate Vercel project rooted at `apps/web` for the existing Next.js application with its in-memory fixture repository. No backend services, databases, credentials, API proxies or AWS resources are included. Preserve all routes and styling. No custom Vercel routing or static export is required; Next.js dynamic routes remain available.

This is a preview hosting exception, not a change to the production architecture or backend trust boundaries. The openly accessible creator screens, simulated access forms and client-side quiz scoring contain sample data only. State resets on refresh. Real authentication and authorization remain Java/Cognito responsibilities in future authorized phases.

Tradeoffs: convenient independent UI review and managed HTTPS, but no durable accounts, actual AI, private assets or proof of integrated AWS readiness. A later backend-connected Vercel deployment requires an architecture review of identity, API reachability and allowed origins.

Deployment settings, checks and rollback are in [the preview guide](VERCEL_PREVIEW.md). No cloud deployment has been performed as part of this proposal.
