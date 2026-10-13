# T014 — Stage static game build on the owner's server

**Status:** BLOCKED: infrastructure facts and permission  
**Milestone:** M6  
**Dependencies / approval:** T013 acceptable build; owner supplies approved access, OS, domain, TLS, bandwidth/storage details  
**Read:** `AGENTS.md`, `docs/00_PROJECT_STATUS.md`, `docs/10_DECISIONS.md`, `docs/08_TECHNICAL_ARCHITECTURE.md`, `docs/09_QA_AND_RELEASE.md`

## Objective

Deploy a reviewed production **build to staging only**, with HTTPS, caching and rollback, without changing public production until authorized.

## In scope

- Verify actual 16-core/8GB reported server inventory, disk/egress, network and system constraints.
- Prepare static build and deploy using an approved SSH/CI path to a specific staging domain/path.
- Configure Caddy or Nginx TLS, appropriate cache headers for hashed assets and compression where useful.
- Create reproducible deploy notes, rollback/checkpoint and a staging browser smoke test.

## Out of scope

- No automatic public launch, DNS changes or secret handling without owner approval.
- No Laravel API, database or analytic tracking.

## Acceptance criteria

- [ ] Staging opens over HTTPS and game assets fetch without cross-origin errors.
- [ ] Versioned assets can be deployed and rolled back safely.
- [ ] No secrets appear in public JS, committed configs or screenshots.
- [ ] Owner can independently open the staging URL and test a full play loop.

## Verification Codex must report

- Show build commands, server config diff (without secrets), curl/header checks and browser smoke test.
- Document actual hosting limits/latency rather than projecting concurrency from CPU alone.

## Deliverables

- Staging URL if authorized and available, deployment runbook, config changes, rollback evidence.

- A completion report at `reports/T014_RESULT.md` using `reports/REPORT_TEMPLATE.md`.

## Stop and ask

Stop before credential requests or infrastructure changes until director explicitly approves secure access and scope.

> **Boundary:** Only do this ticket after Game Director authorization. Never start the next ticket automatically.
