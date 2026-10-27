# UI-01-Vercel: frontend customer preview

Scope: the existing LearnSphere UI only. Next.js root is `apps/web`, containing its own `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, App Router and all assets. No source imports outside this directory are required. See [ADR-008 proposal](ADR-008-VERCEL-PREVIEW.md) for the preview-only exception to ADR-007. Backend phases and AWS production hosting remain unchanged.

## Demo isolation and environment

The current application already runs entirely on typed fixtures and in-memory state through `lib/demo-context.tsx`. No additional mock adapter is necessary. There are no fetch/axios calls, backend URLs, rewrites, external fonts or remote assets in the application code. Localhost URLs exist only in Playwright configuration/tests for the local UI server. They are not deployed backend dependencies.

`NEXT_PUBLIC_DEMO_MODE` is deliberately not introduced: this application currently has only a demo implementation, so a false value would falsely imply a functional live mode. Keep the existing explicit demo labels. Real API integration and a mode selector belong to a future authorized ticket. There are no required application environment variables and no `.env` file to copy.

| Variable | Where | Purpose |
|---|---|---|
| `ENABLE_EXPERIMENTAL_COREPACK=1` | Vercel build settings | Use the committed `packageManager` pin, pnpm 10.20.0. |
| `UI_BASE_URL` | Optional local browser test command | Target an already running production or hosted preview URL. Omit to use the existing local dev test server. |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | Optional local browser test command | Override the Chromium executable. |

Do not copy the repository's Compose credentials, AWS keys, database URLs, AI service tokens or Cognito settings into this project. Next.js `NEXT_PUBLIC_*` values are browser-visible and are inlined at build time ([Next.js documentation](https://nextjs.org/docs/app/guides/environment-variables)). Local `.env*` files and `.vercel` metadata are ignored by frontend Git/Docker rules. No credentials are required by any preview interaction.

Use invented form data. Access forms do not create identities; creator pages are public demo screens. Files are metadata-only selections, tutor replies and generated content are samples, and all changes reset on reload except language preference. This preview is not an LMS production release.

## Vercel project settings and deployment

With authorized Vercel/team and source repository access available:

1. Import the repository as a separate preview project. Select the intended UI review branch; do not attach the real product domain.
2. Set **Root Directory** to `apps/web` and **Framework Preset** to `Next.js`. Leave inclusion of files outside the root disabled.
3. Set Node.js to **22.x**, matching `package.json` and the existing Docker toolchain.
4. Set **Install Command** to `pnpm install --frozen-lockfile`, **Build Command** to `pnpm build`, and leave **Output Directory** at the Next.js default. Set `ENABLE_EXPERIMENTAL_COREPACK=1` for the target build environment. Do not run root `make verify`, Docker, or any backend build in Vercel.
5. Review project access/protection settings for the intended customers, then create a Preview deployment from the review branch when authorized. Importing a project may also create an initial production deployment: review its branch and access settings before triggering it.
6. Confirm the deployment build uses Node 22 and pnpm 10.20.0. Open its assigned HTTPS URL and perform the checks below before sharing it.

Vercel's [build configuration documentation](https://vercel.com/docs/builds/configure-a-build) covers project root, build overrides and Corepack. No `vercel.json` is required: automatic Next.js handling supports the existing static and dynamic App Router pages. Do not add a catch-all rewrite, `output: export`, API proxy or custom start command. Vercel provides [managed SSL certificates](https://vercel.com/docs/domains/working-with-ssl); verify HTTPS on the actual deployment after it exists.

For rollback, restore the last verified deployment in Vercel or revert the UI change and redeploy. There are no database migrations or persisted demo records to roll back. Remove the preview project when review is complete if it is no longer needed.

## Reproduce local verification

Use Node 22 with pnpm 10.20.0 from the repository root:

```sh
pnpm --dir apps/web install --frozen-lockfile
pnpm --dir apps/web lint
pnpm --dir apps/web typecheck
pnpm --dir apps/web test
pnpm --dir apps/web build
pnpm --dir apps/web start --port 3102
```

In a second terminal:

```sh
UI_BASE_URL=http://localhost:3102 pnpm --dir apps/web test:e2e
pnpm --dir apps/web audit --prod --json
```

No backend services are needed. Playwright uses installed Chrome, or install Chromium with `pnpm --dir apps/web exec playwright install chromium`. The browser suite rejects off-origin HTTP(S) requests and `/api`, `/internal`, `/v1` requests across demo scenarios. It covers 15 route examples at three viewport sizes, search/navigation, learning/quiz progress, creator editing, simulated generation, EN/VI, invalid IDs, validation and no-JavaScript form safety.

After deployment, repeat the route/interaction checks against the assigned HTTPS URL. If Vercel deployment protection is enabled, use an authorized browser session; do not commit bypass credentials. Check direct loading and refresh of `/courses/python-for-everyone`, `/learn/python/python-1`, `/quizzes/python-quiz` and `/admin/courses/python/edit`, then test client navigation, EN/VI and sample interactions. Confirm there are no requests to localhost, backend services or AWS, and no mixed-content/browser runtime errors.

## Verification evidence

Executed locally on 2026-10-27. The host defaults to Node 25.2.1, so final frontend checks used Node 22.23.4 via `npx --yes --package=node@22 -c '…'`. The frontend package manager selected the committed pnpm 10.20.0 pin. Initial Node 25 checks also passed, but the evidence below is the final Node 22 run.

| Command actually executed | Result |
|---|---|
| `pnpm --dir apps/web install --frozen-lockfile` | Passed; lockfile unchanged. pnpm warned about an ignored esbuild install script; tests/build still passed. |
| `pnpm --dir apps/web lint` | Passed. |
| `pnpm --dir apps/web typecheck` | Passed. |
| `pnpm --dir apps/web test` | 8 passed, including invalid enrollment and cross-course progress rejection. |
| `pnpm --dir apps/web build` | Passed on Node 22; Next.js 15.5.28 generated 12 static pages and retained dynamic routes. |
| `pnpm --dir apps/web start --port 3102` | Production server started successfully; stopped after verification. |
| `UI_BASE_URL=http://localhost:3102 pnpm --dir apps/web test:e2e` | 9 passed in 30.8s against the production server, including 45 route/viewport checks. No rejected backend/off-origin requests in guarded scenarios. |
| `pnpm --dir apps/web audit --prod --json` | Zero known vulnerabilities in 67 production dependencies. |
| `.venv/bin/python scripts/check_contracts.py` | OpenAPI validation and breaking-change detector self-test passed. |
| `.venv/bin/pytest apps/ai-service/tests -q` | 3 passed; upstream Starlette/httpx deprecation warning. |
| `./gradlew test --tests com.edutech.ContractTest --rerun-tasks` in `apps/api` | Passed; XML reports 2 tests, zero failures/errors. |

The browser runner emitted a harmless NO_COLOR/FORCE_COLOR warning. Contract checks ran without deploying backend services or modifying their source. A real PR-base breaking-change comparison could not run: `git status --short` fails because the workspace has a synthetic non-repository `.git` directory. The checker self-test does not replace that future CI comparison.

Source inspection found no service endpoints or HTTP clients in `app`, `components` or `lib`. A scoped Python regex scan of 41 frontend source/config files found no credential patterns after reviewing and excluding the false-positive translation key `auth.passwordError`; no frontend `.env*` files were present. The built browser JavaScript scan found no AWS key/private-key patterns or loopback IP; its only `localhost` match is Next.js's URL polyfill parsing logic, not a configured endpoint. This is a scoped review, not a comprehensive secret/history audit.

Not executed: Vercel build/deployment, hosted HTTPS smoke checks, customer access/protection checks, custom-domain setup, hosted CI or a Git-history secret scan. Vercel credentials/repository access and an authorized deployment are still needed. Local build and browser success establish readiness to attempt deployment, not proof of hosted behavior. Existing demo limitations (public sample creator screens, ephemeral state, simulated authentication/AI/media) remain intentional. No UI components, layouts, routes or styles changed.

## Modified files

- `apps/web/package.json`: Node 22 runtime declaration.
- `apps/web/.gitignore`, `apps/web/.dockerignore`: exclude local environment files and Vercel metadata.
- `apps/web/e2e/ui.spec.ts`: enforce backend-independent HTTP(S) behavior across browser scenarios.
- `README.md`, `docs/ROADMAP.md`: link deployment guide and name this scoped ticket.
- `docs/ADR-008-VERCEL-PREVIEW.md`, `docs/VERCEL_PREVIEW.md`: preview hosting proposal, settings, environment, evidence and limitations.

UI pages, components, styles, translations, backend sources, schemas, OpenAPI contracts and AWS infrastructure are unchanged.
