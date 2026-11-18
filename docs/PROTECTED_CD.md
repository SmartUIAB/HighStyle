# HighStyle protected release pipeline

This is implemented release configuration, not evidence that hosting, required reviewers or live payments are enabled. The workflow fails closed until the repository administrator configures the controls below and genuine hosted acceptance succeeds. No workflow in this change activates Stripe live mode.

## Release sequence

1. Review the complete feature-branch change. Run the six current security/build gates and hosted purchase acceptance against isolated HighStyle staging services.
2. Run `Hosted staging acceptance` against the exact reviewed feature commit. The runner must observe Stripe test checkout, its reconciled order, inventory concurrency, cancellation/expiry, duplicate webhook handling, refund, receipt delivery, and the browser checks. It produces only a sanitized acceptance artifact; a blocked or skipped test cannot pass.
3. Merge the same tested tree into protected `main`. A merge commit may have a different commit identifier but must have the exact same Git tree. If conflict resolution or any later change modifies that tree, repeat hosted acceptance.
4. Wait for **all six checks on the new main commit**. Dispatch `Protected production release` from `main`, entering its full 40-character commit SHA and the successful hosted acceptance workflow run ID.
5. The protected production environment requests its required reviewer approval. The workflow checks the branch/environment protections, exact latest main CI, trusted acceptance run, and artifact contents. Acceptance older than 72 hours is rejected.
6. Before any provider mutation, the workflow pulls and verifies both Vercel production configurations, project identities and API targets. It resolves the actual Railway project, environment, API service and domain ownership, rejecting staging or unrelated resources. It records the previous API deployment, uploads the exact checked-out source, sets `PAYMENTS_ENABLED=false`, `STRIPE_MODE=test`, `APP_ENV=production`, and `RELEASE_SHA`, then requires the returned deployment to reach `SUCCESS`. `/health/release` must prove the same commit and authorized payment state.
7. It builds and stages storefront and admin production artifacts on their separate Vercel projects with `--skip-domain`. It checks the Vercel authenticated deployment identities, staged storefront/admin pages and both `/api/release` responses before promoting either. Both applications must actually proxy to the intended production API at the exact release commit with payments disabled.
8. It promotes the verified production builds and records their URLs, Railway deployment ID and previous successful Railway deployment pointer in the workflow summary. This is a coordinated release; promotion of two Vercel projects and one API is not one cross-provider atomic operation.

Production uses disabled checkout in this workflow. A separate explicitly authorized change and verification are required to enable live payments; a test-mode acceptance report cannot do that.

## Repository protections that the owner must configure

The connected GitHub integration currently has push permission but does not provide administration permission. Adding a YAML file does not configure these server-side protections.

Protect `main` with at least one approving review, dismissal of stale reviews, required checks that are up to date, and enforcement for administrators. Require these seven check names (six code/build checks and a separate full hosted purchase gate):

- `API security, HTTP and MongoDB transactions`
- `Build frontend`
- `Build backend`
- `Dependency security API`
- `Dependency security frontend`
- `Dependency security backend`
- `Hosted purchase acceptance gate`

Create protected GitHub environments `staging` and `production`. Both require reviewers and prevent self-review. Production deployment branches must use an explicit, exact `main` branch policy; the workflow itself also rejects every non-main ref. Staging custom policies may contain only `main` and `fix/security-foundation-20261117`. Do not allow wildcard branches or tags.

The release gate currently validates GitHub's branch-protection API. If the owner uses an organization ruleset instead, configure the equivalent branch protection or extend and review the gate to validate every required ruleset control; do not disable the validation to silence an API error.

## Production environment values

Enter secrets directly in GitHub's protected environment and provider secret managers. Do not paste them into chat, put them into workflow dispatch inputs, or commit `.env` files.

| Kind | Name | Purpose |
|---|---|---|
| Secret | `RELEASE_GUARD_TOKEN` | Fine-grained, repository-scoped token with Administration **read**, Actions read and Contents read. Branch-protection inspection needs Administration read; the normal workflow token does not grant it. No write permission is needed. |
| Secret | `RAILWAY_PRODUCTION_TOKEN` | Token restricted to the HighStyle production Railway environment. |
| Secret | `VERCEL_PRODUCTION_TOKEN` | Deployment access to the two intended HighStyle Vercel projects. |
| Secret | `VERCEL_STOREFRONT_AUTOMATION_BYPASS_SECRET` | Required only when the staged storefront uses deployment protection; issued for that project. |
| Secret | `VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET` | Required only when the staged admin uses deployment protection; issued for that project. |
| Variable | `RAILWAY_PROJECT_ID`, `RAILWAY_ENVIRONMENT_ID`, `RAILWAY_SERVICE_ID` | Explicit UUIDs for the HighStyle production API; never an HSM project. |
| Variable | `PRODUCTION_API_ORIGIN` | Public HTTPS API origin, without trailing slash or path. |
| Variable | `STAGING_API_ORIGIN`, `STAGING_STOREFRONT_ORIGIN` | Accepted isolated staging origins to verify against the evidence artifact. |
| Variable | `VERCEL_ORG_ID` | Intended Vercel team ID. |
| Variable | `VERCEL_STOREFRONT_PROJECT_ID`, `VERCEL_ADMIN_PROJECT_ID` | Separate production Vercel project IDs. |
| Variable | `VERCEL_CLI_VERSION`, `RAILWAY_CLI_VERSION` | Reviewed exact `x.y.z` package versions; ranges and `latest` are rejected. |

Keep Stripe, webhook, SMTP, JWT and database secrets on the API service. Storefront/admin build settings may expose only their intended public API URL and other public configuration. The misleading legacy variable `NEXT_PUBLIC_API_KEY` is an API **base URL**, never a credential. The public GraphQL endpoint uses `NEXT_PUBLIC_GRAPHQL_ENDPOINT`.

Configure Railway's API root directory as `/API`, startup as `npm start`, and readiness path `/health/ready`. The CLI uploads the repository root to preserve that configured subdirectory. `.railwayignore` excludes browser applications, development outputs, local environment files and credential-like browser state. Keep production MongoDB, volumes, SMTP and domains isolated from staging. The workflow does not create databases, run destructive migrations, or copy customer records.

The production Railway project must be named `highstyle-production`, its environment `production`, and the API service `highstyle-api`. The Vercel storefront project must be `highstyle-production-web`, `highstyle-web`, `highstyle-production-storefront`, or `highstyle-storefront`; the admin must be `highstyle-production-admin` or `highstyle-admin`. Explicit provider IDs, team membership, resource names, monorepo roots and API domain ownership are all checked. Known HighStyle staging project/service IDs are independently rejected even if renamed. An unrelated HSM resource cannot become a release target by changing only a workflow variable.

Vercel project roots are `frontend` and `backend` respectively. The workflow creates two separate monorepo-root copies from `git archive` of the verified commit and runs Vercel CLI from each root, preserving independent `.vercel` state. It does not run the CLI from a subdirectory and accidentally apply the configured root twice. Disable independent automatic production promotion so a provider Git integration cannot release main before these gates. Vercel project builds must target the production API. Railway automatic source deploys must likewise not race this explicit upload release.

## Evidence contract and trust

`scripts/release/evidence.mjs` defines the complete contract. The acceptance artifact is named `hosted-acceptance-<full tested commit SHA>` and contains `hosted-acceptance.json`. Its fields include repository, full source commit and tree, staging HTTPS origins, test-mode payment identifiers, matching integer minor-unit amounts/currency, persisted order state, start/end timestamps and every required observed check.

The production workflow accepts only an artifact attached to a successful `workflow_dispatch` run, or a reviewed push run from `fix/security-foundation-20261117`, of `.github/workflows/hosted-acceptance.yml` in this repository. A local JSON file, a manually uploaded report, an arbitrary workflow run, or unit-test success alone does not unlock release. The staging workflow runs reviewed code behind its protected environment and uploads the report only after validation. Raw Stripe responses, secrets, browser storage and screenshots of credentials must not be uploaded.

Reviewers remain responsible for the exact code they approve. An evidence schema cannot independently prove that unreviewed code really performed a test. This is why protected branches and protected staging secrets are required in addition to the JSON checks.

## Failure and rollback

- Missing credentials, inaccessible protection settings, an absent required check, source mismatch, live Stripe mode, or a skipped browser/payment step stops before any production deployment.
- A Railway upload is only queued until its returned deployment ID reaches `SUCCESS`. Unknown or failed status prevents Vercel promotion. The previous deployment pointer is written before the first provider mutation, and the new deployment ID immediately after upload, so a failed release retains both recovery references when available.
- A failed Vercel build or smoke leaves its new production build unpromoted. The API may already serve the new backward-compatible version; inspect its logs and the stored previous deployment pointer.
- If one project promotion fails after the other succeeds, inspect both domain assignments and use Vercel's explicit rollback/promotion tooling for the affected project. Do not claim a cross-provider atomic rollback.
- Reuse the previous verified application release for rollback. Do not delete or rewind financial records, payment-event deduplication, inventory reservations, or production database volumes. Any schema migration needs its own rehearsed forward/rollback plan and verified restorable backup.
- Once a deployment has been repaired, rerun the exact protected pipeline. Do not skip an incomplete check or relabel test evidence as successful.

## Local verification

```bash
node --test scripts/release/test/*.test.mjs
```

These tests verify rejection of unsafe release evidence and protection settings. They are also part of the API CI gate. They do not claim a real Stripe payment, browser purchase or production deployment.

## Hosted acceptance configuration

The `staging` protected environment uses these secrets: `RELEASE_GUARD_TOKEN` (same read-only permissions as above), `STAGING_STRIPE_SECRET_KEY` (test-mode only), `STAGING_STRIPE_WEBHOOK_SECRET`, `STAGING_MONGODB_URI`, and `STAGING_VERCEL_AUTOMATION_BYPASS_SECRET` only if the staging storefront is protected. Its variables are `STAGING_API_ORIGIN`, `STAGING_STOREFRONT_ORIGIN`, and `STAGING_SMTP_API_ORIGIN` (an isolated Mailpit API origin used to verify actual receipt delivery). Browser-only mode does not require Stripe, SMTP or MongoDB credentials: it uses an existing seeded `STAGING-` product through the hosted API and creates fresh synthetic customers. The suite creates dedicated synthetic customers with fresh random passwords; it never modifies an existing customer's credentials.

Set repository variable `HIGHSTYLE_HOSTED_ACCEPTANCE_ENABLED=true` only when the protected staging environment, provider secrets and reviewed code are ready. This allows an approval-gated push run on the known remediation branch, so full acceptance can run **before merging the workflow to main**. After the workflow is available on main, it also supports manual dispatch. If the deployment is not yet serving that exact push SHA, the run fails; deploy the same SHA and rerun the job.

Run the full suite with `node scripts/acceptance/hosted-purchase.mjs`, or run only the application browser journey with `node scripts/acceptance/hosted-purchase.mjs --browser-smoke`. Set `PLAYWRIGHT_MODULE` to the installed Playwright `index.mjs` file and `HOSTED_ACCEPTANCE_OUTPUT` to a temporary JSON output path. The workflow installs pinned Playwright 1.65.1 and Chromium, Firefox and WebKit. It invokes real browser binaries; WebKit with a mobile viewport is not a physical iPhone or the Safari application.

Fixture writes require `ALLOW_STAGING_FIXTURES=true`, a healthy hosted release identifying itself as staging at the exact checked-out commit, and a writable replica-set database named `highstyle_staging` or `highstyle_staging_<suffix>`. A newly created product is read back through the hosted API to verify that the API and test database agree. The test leaves labeled synthetic audit records, expires its own unfinished checkouts where possible, and hides its unreserved test products afterward. It never drops databases or deletes financial history.

Full acceptance uses Stripe's documented 4242 test card only after the browser is on `https://checkout.stripe.com` and the session is verified as test-mode for the intended fixture customer/order. It first proves that the original provider webhook arrived automatically, then signs and replays only that original event to verify deduplication. A signature generated by the test cannot substitute for proof of automatic provider delivery. The suite verifies partial/full test refunds, keeps physical stock consumed until a separate return process, and reads the dedicated receipt from Mailpit. Missing browser binaries, external challenges, unavailable credentials, or a missing receipt stop acceptance.

Browser-only reports have `kind: browser-smoke` and retain payment checks as blocked. They cannot unlock the production workflow, even if every browser check succeeds. Full reports have `kind: hosted-purchase`. No browser storage, passwords, cards, raw provider responses or credentials are retained in either artifact.

The MongoDB replica set and Mailpit remain private. The full suite needs an approved private-network runner, authenticated tunnel, or dedicated authenticated test access path. Do not expose an unauthenticated Mailpit UI/API, publish a database port, or weaken database authentication to run the suite. A private HTTPS receipt gateway may use secret `STAGING_SMTP_API_TOKEN`; the runner sends it only in an Authorization header to the configured receipt origin and never to a query string or artifact. The standard GitHub-hosted runner cannot reach Railway private service DNS without that separately configured access path. Browser-only smoke uses only public storefront/API HTTPS origins and requires none of these internal access changes.

The dedicated `Hosted purchase acceptance gate` job fails whenever full acceptance is skipped, blocked, failed or replaced with browser-only smoke. Require it on main in addition to the six code/build checks to prevent merging before actual purchase acceptance. A skipped job name alone is not a sufficient merge gate.
