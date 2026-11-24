import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyAcceptance, verifyApiRelease, requireExactVersion, requireHttpsOrigin, REQUIRED_ACCEPTANCE_CHECKS } from '../evidence.mjs';
import { verifyProtectedEnvironment } from '../github.mjs';

const sha = 'a'.repeat(40);
const tree = 'b'.repeat(40);
const now = Date.parse('2026-11-18T12:00:00Z');
function evidence() {
  return {
    schemaVersion: 1, kind: 'hosted-purchase', repository: 'SmartUIAB/HighStyle', commit: sha, sourceTree: tree,
    environment: 'staging', stripeMode: 'test',
    startedAt: '2026-11-18T11:00:00Z', finishedAt: '2026-11-18T11:15:00Z',
    apiOrigin: 'https://highstyle-staging.example.com', storefrontOrigin: 'https://highstyle-staging.vercel.app',
    checks: Object.fromEntries(REQUIRED_ACCEPTANCE_CHECKS.map(name => [name, 'passed'])),
    stripe: { sessionId: 'cs_test_acceptance', paymentIntentId: 'pi_acceptance', livemode: false, status: 'complete', paymentStatus: 'paid', amountMinor: 2500, currency: 'usd' },
    order: { id: 'a'.repeat(24), sessionId: 'cs_test_acceptance', paymentIntentId: 'pi_acceptance', paymentStatus: 'PAID', amountMinor: 2500, currency: 'usd' },
  };
}

test('release evidence permits a completed test purchase bound to the same source tree', () => {
  const sample = evidence();
  assert.equal(verifyAcceptance(sample, { commit: sha, sourceTree: tree, now }), sample);
});
test('missing credentials or a skipped browser cannot be converted to acceptance', () => {
  for (const status of ['skipped', 'blocked', 'failed', undefined]) {
    const sample = evidence(); sample.checks.browserWebkit = status;
    assert.throws(() => verifyAcceptance(sample, { now }), /browserWebkit/);
  }
});
test('browser-only smoke never unlocks production payment acceptance', () => {
  const sample = evidence(); sample.kind = 'browser-smoke';
  assert.throws(() => verifyAcceptance(sample, { now }), /Browser smoke/);
});
test('live mode is rejected regardless of payment success', () => {
  const sample = evidence(); sample.stripe.livemode = true;
  assert.throws(() => verifyAcceptance(sample, { now }), /Live-mode/);
  const other = evidence(); other.stripeMode = 'live';
  assert.throws(() => verifyAcceptance(other, { now }), /test-mode/);
});
test('provider success is insufficient without matching settled order amount and identity', () => {
  for (const [field, replacement] of [['paymentStatus', 'PENDING'], ['amountMinor', 1], ['sessionId', 'cs_test_other'], ['currency', 'eur'], ['paymentIntentId', 'pi_other']]) {
    const sample = evidence(); sample.order[field] = replacement;
    assert.throws(() => verifyAcceptance(sample, { now }), /settled|do not match/);
  }
});
test('acceptance cannot be reused for different code, site or stale dates', () => {
  for (const expected of [{ commit: 'c'.repeat(40) }, { sourceTree: 'c'.repeat(40) }, { apiOrigin: 'https://other.example.com' }, { storefrontOrigin: 'https://other.vercel.app' }, { now: now + 74 * 60 * 60_000 }, { now: now - 2 * 60 * 60_000 }]) {
    assert.throws(() => verifyAcceptance(evidence(), { now, ...expected }), /does not match|differs|recent/);
  }
});
test('credential-like material is never accepted into the release artifact', () => {
  const sample = evidence(); sample.debug = 'whsec_forbidden_test_fixture';
  assert.throws(() => verifyAcceptance(sample, { now }), /credential-like/);
});
test('production health requires exact SHA and disabled checkout without live mode', () => {
  const health = { status: 'ready', commit: sha, environment: 'production', paymentsEnabled: false, stripeMode: 'test' };
  const expected = { commit: sha, environment: 'production', paymentsEnabled: false };
  assert.equal(verifyApiRelease(health, expected), health);
  for (const patch of [{ commit: 'c'.repeat(40) }, { paymentsEnabled: true }, { stripeMode: 'live' }, { environment: 'staging' }, { status: 'not-ready' }]) {
    assert.throws(() => verifyApiRelease({ ...health, ...patch }, expected));
  }
});
test('deployment endpoints exclude HTTP, credentials, query strings and arbitrary paths', () => {
  for (const value of ['http://example.com', 'https://user:pass@example.com', 'https://example.com/x', 'https://example.com?secret=x', 'https://localhost', 'https://127.0.0.1']) {
    assert.throws(() => requireHttpsOrigin(value));
  }
  assert.equal(requireHttpsOrigin('https://shop.example.com'), 'https://shop.example.com');
});
test('deployment CLI versions must be exact and cannot include tags or shell input', () => {
  for (const version of ['latest', '^5.0.0', '5.0.0;echo bad', '', undefined]) assert.throws(() => requireExactVersion(version, 'CLI'));
  assert.equal(requireExactVersion('5.23.3', 'CLI'), '5.23.3');
});
test('missing, self-approvable or open protected environments fail closed', async () => {
  const base = { protection_rules: [{ type: 'required_reviewers', prevent_self_review: true, reviewers: [{ type: 'User', reviewer: { id: 1 } }] }], deployment_branch_policy: { protected_branches: true } };
  await assert.rejects(() => verifyProtectedEnvironment(async () => base, 'production'), /restrict allowed/);
  assert.equal(await verifyProtectedEnvironment(async () => base, 'staging'), base);
  for (const sample of [{}, { ...base, protection_rules: [] }, { ...base, protection_rules: [{ ...base.protection_rules[0], prevent_self_review: false }] }, { ...base, deployment_branch_policy: null }]) {
    await assert.rejects(() => verifyProtectedEnvironment(async () => sample, 'production'));
  }
});
test('custom production policy cannot admit feature branches, wildcards or tags', async () => {
  const environment = { protection_rules: [{ type: 'required_reviewers', prevent_self_review: true, reviewers: [{}] }], deployment_branch_policy: { protected_branches: false, custom_branch_policies: true } };
  for (const policy of [{ name: '*', type: 'branch' }, { name: 'feature', type: 'branch' }, { name: 'main', type: 'tag' }]) {
    await assert.rejects(() => verifyProtectedEnvironment(async path => path.includes('deployment-branch-policies') ? { total_count: 1, branch_policies: [policy] } : environment, 'production'), /branches or tags/);
  }
});
