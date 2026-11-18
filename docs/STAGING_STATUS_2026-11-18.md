# HighStyle staging implementation and release handoff — 18 November 2026

## Open the isolated staging applications

- Storefront (Arabic): https://highstyle-staging-web.vercel.app/ar
- Storefront (English): https://highstyle-staging-web.vercel.app/en
- Administration: https://highstyle-staging-admin.vercel.app
- API readiness and release identity: https://highstyle-api-staging.up.railway.app/health/release
- Storefront proxy release identity: https://highstyle-staging-web.vercel.app/api/release
- Pull request and current source: https://github.com/SmartUIAB/HighStyle/pull/1

The canonical Vercel aliases are staging applications even though Vercel calls their alias-serving deployment target `production`. They belong to dedicated staging projects. The API identifies itself as `environment: staging`, `stripeMode: test`, with checkout disabled until test-account access is configured.

The catalog contains six explicitly labeled staging samples, including an unavailable product. It is not a production catalog. No production customer data was imported.

## Implemented behavior

- MongoDB transactions reserve the complete cart or roll back all changes. Conditional inventory updates prevent overselling; one active reservation per cart and provider idempotency prevent double holds.
- Signed payment settlement commits stock, order, financial transaction, event ledger and receipt outbox together. Cancellation and expiry release stock only after provider confirmation. Ambiguous provider errors retain the reservation for reconciliation.
- Staff changes cannot delete reserved products or reduce on-hand inventory below current holds. Financial refunds do not automatically restock merchandise that has not been returned.
- The responsive AR/EN storefront has real catalog search, ordering and availability filtering, explicit variant selection, an inline cart/address/summary flow, and customer-owned order confirmation.
- Returning from hosted checkout through browser Back restores controls and reads the exact customer-owned order before offering cancellation. A pending order is never presented as evidence of failed payment.
- Home pages are prerendered for each supported locale so Arabic starts with Arabic text and RTL direction. Authentication forms use a POST fallback and remain disabled until hydration/router readiness, preventing early native GET submissions of credentials.
- Vercel uses a same-origin API proxy so the browser receives secure HttpOnly session cookies. Stripe and database credentials remain server-side.

## Isolated infrastructure

| Resource | Staging configuration |
| --- | --- |
| Railway project / environment | `highstyle-staging` / `staging` |
| Railway API | `highstyle-api`, Node 24, `/API`, readiness check, persistent uploads volume |
| Database | Separate MongoDB HA replica set; database `highstyle_staging`; private networking |
| Mail | Private Mailpit capture service; synthetic test mail only |
| Vercel storefront | `highstyle-staging-web`, root `frontend`, Node 24 |
| Vercel administration | `highstyle-staging-admin`, root `backend`, Node 24 |
| Payment policy | `PAYMENTS_ENABLED=false`, `STRIPE_MODE=test`, `LIVE_PAYMENTS_APPROVED=false` |

The known staging infrastructure IDs are explicitly rejected by the production release guard. Existing unrelated projects were not repurposed.

## Verification completed before this handoff

- API: **94 tests passed**, zero failures or skips, against a real MongoDB 7 replica set. Coverage includes ten buyers competing for three units, repeated checkout, multi-item rollback, cancellation/payment races, ambiguous provider responses, expiry recovery and order ownership.
- Storefront helpers: **11 tests passed**; TypeScript passed.
- Storefront production build: passed, 106 generated pages after locale prerendering. Emitted Arabic/English HTML and disabled POST authentication forms were checked before hydration.
- Administration production build: passed.
- Full dependency audit: **zero reported vulnerabilities** in both browser applications after replacing the vulnerable Sass watcher chain.
- Release guards: **25 tests passed**, including refusal of staging targets, incorrect API proxies, missing acceptance, live payment evidence and unprotected environments. Workflow YAML and script syntax were checked.
- Manual hosted-browser inspection verified the live catalog, availability filtering, ascending price ordering, product details, unauthenticated cart/login return navigation, Arabic language switching and RTL presentation.

An actual hosted browser-only run on `c86a50cafde13b05cafe9e1008c167edc65e1b77` passed Chromium 159, Firefox 159 and WebKit 27.2, with a 390×844 mobile viewport, RTL, login, product options, cart quantity changes, address persistence, session reload and keyboard checks. See the [sanitized baseline report](evidence/browser-smoke-c86a50c.json). Its seven provider/payment checks remain explicitly blocked; it cannot authorize production delivery. WebKit emulation is not a physical iPhone/Safari-device test.

The final deployed commit and final browser rerun must be read from the actual release identity and PR status. The screenshot below documents the Arabic storefront at checkpoint `6a4bd9e5f780bea2eaddd5f7b5fa9430b6051083`; it is visual evidence only and cannot authorize release.

![Arabic staging storefront](screenshots/highstyle-staging-ar.jpg)

The official `sass-embedded` compiler is pinned to `1.89.2`, the last release before fallback packages reintroduce the advisory-bearing `sass → @parcel/watcher → picomatch` chain. No audit exclusion or severity downgrade was added. Revisit this compatibility pin when an upstream dependency tree resolves GHSA-fc5q-39xc-vjpf; repeat both builds and full audits before changing it.

## Gates still requiring external account access

### Real Stripe test-mode acceptance

The application integration and fail-closed acceptance runner are implemented. A real provider-backed hosted test payment has **not** been accepted yet because Stripe test-account access and its signing secret are unavailable in this session.

Configure the dedicated test account's `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` directly in the Railway API secret manager. The webhook destination is `https://highstyle-api-staging.up.railway.app/webhook`. Never put credentials in chat, browser bundles, source control or workflow dispatch inputs. Keep the mode `test`; only enable staging checkout after the keys, webhook and runner connectivity have been validated.

Full acceptance must prove a paid `cs_test_` session, the matching settled order and amount, original automatic signed webhook delivery, duplicate handling, partial/full test refunds, cancellation/expiry, concurrent inventory reservations, receipt delivery and the browser checks. Browser-only success is explicitly insufficient.

MongoDB and Mailpit remain private. Use an approved private runner/network path or authenticated test gateway; do not expose the test database or an unauthenticated mailbox just to make acceptance pass.

### Protected production delivery

The connected GitHub identity has push permission but **no repository administration permission**. The workflow therefore cannot be described as activated protected CD until the owner configures actual `main` branch protection, exact required checks and protected `staging`/`production` environments, together with scoped secrets. See [PROTECTED_CD.md](PROTECTED_CD.md) for the complete reviewed configuration.

The production workflow requires the tested source tree, successful complete hosted acceptance, exact-main CI, approval protection, explicit production target identities, and verified production API proxies before promotion. It keeps payments disabled. The independent hosted purchase gate deliberately rejects skipped checks and browser-only runs.

Main merge and production promotion remain conditional on those gates. Live payment activation requires a separate explicit authorization; no workflow here enables it.
