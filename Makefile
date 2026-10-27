.PHONY: verify smoke
verify:
	pnpm --dir apps/web install --frozen-lockfile
	pnpm --dir apps/web lint
	pnpm --dir apps/web typecheck
	pnpm --dir apps/web test
	pnpm --dir apps/web build
	cd apps/api && ./gradlew clean test bootJar
	cd apps/ai-service && ruff check . && ruff format --check . && mypy . && pytest
	cd apps/ai-worker && ruff check . && ruff format --check . && mypy . && pytest
	python scripts/check_contracts.py
	pnpm --dir contracts generate
	pnpm --dir infra/cdk typecheck
	pnpm --dir infra/cdk synth:dev
	pnpm --dir infra/cdk synth:prod
smoke:
	python scripts/smoke.py
