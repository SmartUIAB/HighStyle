# HighStyle release acceptance — 2026-11-17

## Current evidence
- Security and build CI passed all six gates on commit `c70def9427e06038cfa74cf4864c43768f929225`: https://github.com/SmartUIAB/HighStyle/actions/runs/44108930342
- CI now checks pull requests targeting main, pushes to main and the remediation feature branch.
- All three npm runtime dependency audit gates passed at the checked commit.
- No provider Sandbox payment, full browser purchase, inventory reservation, production database migration, SMTP receipt, or production rollout was accepted by this evidence.
- Following this evidence, any new commit must re-run ALL gates before being treated as releasable.
- A protected main branch and required status checks are not yet configured by the repository administrator.

## Provider topology (do not assume HighStyle is connected)
- Connected Vercel team was checked and contains only projects unrelated to HighStyle. New storefront/admin projects, GitHub repo binding, runtime URLs and Vercel protected environments must be explicitly configured.
- Connected Railway projects were checked and contain no HighStyle project. Create an isolated HighStyle staging API plus transactional MongoDB replica set, persistent media storage and email/outbox worker. Do not reuse Home Services Marketplace infrastructure.
- The deployment source is the reviewed monorepo main commit. The independently rooted `frontend`, `admin` and `dev1` branches are NOT equivalent release artifacts.
- Vercel project root directories are `frontend` and `backend`. Railway API root is `API`; healthcheck is `/health/ready`.
- Use distinct staging and production environment variables, databases, URLs, Stripe keys, webhook secrets and SMTP accounts.
- Keep all API, Stripe, PostNord, SMTP, JWT and MongoDB secrets server-side. Never enter secrets as `NEXT_PUBLIC_*`, check into Git, or paste them into chat logs.

## Payment acceptance, in order
1. Correctly reconcile all in-flight legacy Stripe sessions, existing carts, order snapshots and unique indexes after a verified, restorable staging backup.
2. Implement and test atomic inventory reservation and decrement, concurrent checkout oversell protection, reservation release on expiration/cancellation, and refund/return policy before taking payments.
3. Enable `PAYMENTS_ENABLED=true` ONLY in an isolated staging API using Stripe **test-mode** keys supplied through Railway encrypted secrets.
4. Run real Stripe test-mode card checkout, cancellation, stale/duplicate/reordered signed webhooks, partial and full refunds, session expiration and payment idempotency tests against the hosted URLs and real Mongo replica set.
5. Verify receipt email delivery, media persistence, cookies and CORS, monitoring, and error handling. Confirm no financial records duplicate when network/SMTP fails.
6. Run end-to-end storefront and admin journeys on desktop Chrome, Firefox, Safari and mobile devices including accessibility and RTL. Resolve UI and data consistency errors.
7. Promote only the **same tested commit** via protected deployment, smoke tests, and a rollback plan that preserves financial ledger history.
8. Live Stripe activation is a separate operational approval requiring actual test evidence, approved merchant account, correct legal/tax/operator details and live secrets. Test-mode approval never grants live activation.

## Deploy and CI/CD controls
- Permanent CI: `.github/workflows/security-validation.yml`.
- Do not make production Vercel/Railway deployments from arbitrary feature pushes or pull requests, and do not turn on automatic production deploy until main protection and reviewed, required CI checks are active.
- Vercel: two distinct projects for storefront and admin, connected to the same monorepo with independent root directories. Configure previews on feature branches and production on protected main only. For final rollout, build production and stage with `--skip-domain`, verify, then explicitly promote the tested build.
- Railway: API service from reviewed repository main; isolated environments, database, service vars and HTTPS public domain. Deploy via approved source and verify terminal SUCCESS and `/health/ready`.
- Protect GitHub `main` with required reviewers and six checks; ensure required deployment environments have restricted branches and reviewer approval.
- If any required CI, migration, provider or end-to-end check fails or cannot be verified, keep PR in draft; do not merge, publish, or turn on live payments.

## Release signoff matrix
| Gate | Evidence required | Current state |
|---|---|---|
| Code/contract/Mongo security tests | 68/68 CI plus new tests after changes | PASS on cited commit; rerun on latest |
| Storefront and admin production builds | GitHub CI | PASS on cited commit; rerun on latest |
| All three dependency audits | GitHub CI | PASS on cited commit; rerun on latest |
| Inventory reservation | concurrent DB tests + integration | NOT COMPLETE |
| Hosted Stripe test-mode acceptance | payment/provider/HTTP evidence | NOT COMPLETE |
| DB migration + backup + rollback | staging rehearsal | NOT COMPLETE |
| Browser, Safari, mobile, RTL, accessibility | hosted E2E evidence | NOT COMPLETE |
| Vercel/Railway project and env links | deployment URLs and healthy status | NOT CONFIGURED |
| GitHub branch protection + protected CD | admin settings | NOT CONFIGURED |
| Production live payment approval | signed operational decision | NOT GIVEN |

This document is a release gate, not a claim of complete deployment. Do not substitute a green unit-test count for end-to-end provider acceptance.
