# HighStyle security foundation — 2026-11-17

## Scope and release status

This change targets `main` at `daa2c570aa864f153ed0ecd93ceb8efa0ab61b52`. It is the first security remediation phase, **not a production-ready release or a complete rewrite**. The independently rooted `frontend`, `admin` and `dev1` deployment branches are not modified by this PR. Confirm the deployed source and environment before any rollout.

The release remains blocked until dependency security gates, deployment/migration preflight and hosted acceptance pass. Do not deploy merely because the API tests or Next.js builds pass. Checkout is explicitly **disabled by default** (`PAYMENTS_ENABLED` must be exactly `true`).

## Implemented boundaries

- A verified, expiring HS256 JWT must resolve to a current database record. Staff/customer identities are distinct; an environment `TOKEN` never substitutes for user authentication.
- Every root GraphQL operation has an explicit fail-closed policy, checked for coverage by tests. Administrator self-registration, legacy order creation, arbitrary payment-state edits and public pending-order cleanup are disabled.
- Customers can access only their own carts, orders, favourites and reviews. Company-scoped administrator resources are checked before mutations, image deletions or ownership-sensitive side effects. Legacy global datasets without a company boundary require an explicit `PLATFORM_ADMIN_IDS` allowlist; ordinary company admins are not global administrators.
- Password hashes are absent from GraphQL output contracts. Review authors do not expose email. Customer password reset tokens are consumed atomically and password changes invalidate older authentication versions.
- Cart and checkout totals come from current catalog records, not client prices/titles/totals. Quantity, variants, availability and aggregate physical stock are validated. Monetary calculations use integer minor units and the order stores a pricing snapshot.
- Repeated identical checkout requests use a stable server-derived idempotency key. Redirect URLs come from the configured storefront and a supported locale.
- Stripe's signed raw body is verified before parsing. Signed events must also match the stored session, order owner, amount, currency and mode. Payment, transaction, event ledger, receipt task and notification writes commit in one MongoDB transaction. Failed processing rolls back; retries and duplicate events do not duplicate financial records. Payment never implies shipment. Refund totals are monotonic.
- Receipt email uses a separate lease/retry outbox, verified customer data and escaped HTML. SMTP failure does not cause payment reversal or replay. SMTP remains at-least-once delivery, not a promise of exactly-once email.
- Staff authentication precedes multipart parsing. Image upload is bounded and streamed, uses generated filenames, checks a restricted MIME/signature allowlist and prevents path/symlink escape. This is **not** a full image decoder or malware scanner.
- API startup awaits the database, exposes separate liveness/readiness, validates deployment configuration and closes resources on shutdown. Authentication requests have a bounded per-process limiter and GraphQL has a query complexity budget.
- Real login routes replace demo entry points. Public admin registration is no longer offered. Client GraphQL selections match the changed user/review schema; upload requests send the required Apollo preflight header.

## Configuration and deployment preflight

See `API/.env.example` for names and safe local defaults. Never put server secrets in `NEXT_PUBLIC_*` variables or commit a real `.env`.

1. Back up the database and verify restore procedures. Test changes on a separate staging database first. No production data migration is performed by this PR.
2. Reconcile duplicate carts per customer **before** enabling the unique `Cart.userId` index. Choose merge/archive handling deliberately; do not delete duplicate customer data to make startup pass. Review existing order/transaction indexes and legacy duplicates as well.
3. Existing in-flight payment sessions/orders lack the new amount/session/snapshot binding. Freeze new checkout creation, reconcile those sessions through a reviewed operational migration, and verify no paid order is lost. The handler deliberately refuses to guess missing payment linkage.
4. Payments require MongoDB transactions: a replica set or sharded deployment, appropriately permitted connection credentials and working indexes. An ordinary standalone MongoDB server is not sufficient. Startup rejects payments on a standalone server.
5. Configure exact `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`, proxy hops and session-cookie topology. HTTPS is required in production. For a genuinely cross-site API, `SameSite=None` requires `Secure`; prefer a same-site domain arrangement where practical. Do not trust arbitrary forwarding headers.
6. Choose trusted existing staff IDs for `PLATFORM_ADMIN_IDS` through operator review. Do not treat every company administrator as a platform administrator. This patch does not automatically promote users or seed an all-powerful public account.
7. Set Stripe test-mode keys and webhook secret in staging, subscribe to supported Checkout/refund events, complete Stripe Sandbox/browser acceptance, and test retry/delayed delivery. Only then explicitly authorize payment activation. Never use the CI placeholder values in a deployment.
8. Confirm persistent upload storage, email delivery and an operational receipt dispatcher. The current bounded limiter is process-local; multi-replica deployments need a shared abuse-control layer. Local uploads are not a substitute for shared, durable object storage.

## Test execution

With API dependencies installed:

```sh
npm ci --ignore-scripts --prefix API
npm test --prefix API
```

Without `MONGODB_TEST_URI`, database integration tests are explicitly skipped. This is not full acceptance. In CI, `RUN_DB_TESTS=true` makes a missing URI fatal and a real disposable replica set is started. The integration harness refuses to reset anything except a loopback database named `highstyle_ci`. Never point it at staging or production.

The test suite covers negative authorization, schema/query compatibility, price tampering, HTTP signature verification, cookies/CORS, safe file streaming, genuine MongoDB transactions, concurrent replay, rollback on side-effect failure, changed-cart preservation, out-of-order refunds, receipt retries and single-use password reset.

Stripe's SDK signature verifier is exercised, but Checkout API calls and SMTP are simulated. CI does **not** prove real provider credentials, webhooks, DNS, mobile Safari, accessibility, browser checkout, hosted cookies or deployed frontend/backend connectivity.

The permanent workflow is read-only, pins action commits, builds both web applications, retains JUnit evidence and separately audits all three runtime lockfiles. High/critical advisories deliberately fail the dependency gate; they are not hidden behind `continue-on-error`.

## Known remaining release blockers

- Upgrade and revalidate legacy Next.js 13/14, Apollo Server 3 and other vulnerable dependencies. Do not apply `npm audit fix --force` blindly. A dependency count is advisory inventory, not proof of exploitability or remediation.
- Stock checks do not reserve or decrement inventory across competing paid orders. Multi-session cancellation, reservation/expiry and oversell handling require a separate transactional inventory design before live commerce.
- A cart changed after Checkout creation is preserved rather than deleted. It may still contain previously purchased lines; a deliberate cart reconciliation UX is still required.
- Retry of an expired Checkout session and legacy session migration need explicit business rules. This patch does not silently create replacement charges.
- Redesign/repair the storefront's legacy homepage product queries, guest/local-vs-server cart duplication, SSR-only browser APIs, currency display, RTL, accessibility, media optimization and real dashboard statistics.
- Move privileged carrier API calls out of browser bundles and rotate any previously published external service credentials. No external key was rotated or provider account altered here.
- Complete tenant-aware modeling for legacy global orders/coupons/reports. The restrictive platform allowlist is a fail-closed interim boundary, not the final multi-tenant schema.
- Add hosted end-to-end tests, real Stripe Sandbox acceptance, durable backups, monitoring/alerts and release/rollback drills. Bind deployed artifacts to the reviewed commit rather than independently diverged branches.

## Rollback

No production deployment or destructive data migration is included. Keep `main` unchanged until acceptance. Before any future deployment, define a rollback that preserves new payment event/outbox records and never rolls back financial history blindly. New session/version/index constraints may require operator-led compatibility handling; a code revert alone is not a database rollback.
