import { readFile } from 'node:fs/promises';

export const REPOSITORY = 'SmartUIAB/HighStyle';
export const REQUIRED_CI_JOBS = Object.freeze([
  'API security, HTTP and MongoDB transactions',
  'Build frontend',
  'Build backend',
  'Dependency security API',
  'Dependency security frontend',
  'Dependency security backend',
]);
export const REQUIRED_MAIN_CHECKS = Object.freeze([...REQUIRED_CI_JOBS, 'Hosted purchase acceptance gate']);
export const REQUIRED_ACCEPTANCE_CHECKS = Object.freeze([
  'inventoryConcurrency', 'checkoutSuccess', 'checkoutCancel',
  'webhookIdempotency', 'refund', 'sessionExpiry', 'receiptDelivery',
  'browserChromium', 'browserFirefox', 'browserWebkit', 'mobileViewport', 'rtl',
]);

export function requireValue(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`);
  return value.trim();
}

export function requireSha(value, label = 'Commit') {
  if (!/^[a-f0-9]{40}$/.test(value || '')) throw new Error(`${label} must be a full 40-character SHA`);
  return value;
}

export function requireHttpsOrigin(value, label = 'Origin') {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label} must be an HTTPS origin`); }
  if (url.protocol !== 'https:' || url.origin !== value || url.username || url.password ||
      !url.hostname.includes('.') || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error(`${label} must be a public HTTPS origin without a path, credentials or query`);
  }
  return value;
}

export function requireExactVersion(value, label) {
  if (!/^\d+\.\d+\.\d+$/.test(value || '')) throw new Error(`${label} must be a reviewed exact x.y.z version`);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function verifyAcceptance(evidence, expected = {}) {
  assert(evidence?.schemaVersion === 1, 'Unsupported or absent acceptance evidence schema');
  assert(evidence.kind === 'hosted-purchase', 'Browser smoke cannot substitute for hosted purchase acceptance');
  assert(!evidence.outcome || evidence.outcome === 'passed', 'Acceptance run did not finish successfully');
  assert(evidence.repository === REPOSITORY, 'Acceptance belongs to a different repository');
  requireSha(evidence.commit, 'Acceptance commit');
  requireSha(evidence.sourceTree, 'Acceptance source tree');
  if (expected.commit) assert(evidence.commit === expected.commit, 'Acceptance commit does not match the workflow run');
  if (expected.sourceTree) assert(evidence.sourceTree === expected.sourceTree, 'Accepted source tree differs from the release tree');
  assert(evidence.environment === 'staging' && evidence.stripeMode === 'test', 'Only isolated Stripe test-mode acceptance is permitted');
  requireHttpsOrigin(evidence.apiOrigin, 'Staging API');
  requireHttpsOrigin(evidence.storefrontOrigin, 'Staging storefront');
  if (expected.apiOrigin) assert(evidence.apiOrigin === expected.apiOrigin, 'Acceptance API origin differs from configured staging');
  if (expected.storefrontOrigin) assert(evidence.storefrontOrigin === expected.storefrontOrigin, 'Acceptance storefront differs from configured staging');
  const started = Date.parse(evidence.startedAt);
  const finished = Date.parse(evidence.finishedAt);
  const now = expected.now ?? Date.now();
  assert(Number.isFinite(started) && Number.isFinite(finished) && started <= finished, 'Acceptance timestamps are invalid');
  assert(finished <= now + 60_000 && now - started <= 72 * 60 * 60_000, 'Acceptance must be recent (at most 72 hours old) and not future-dated');
  for (const check of REQUIRED_ACCEPTANCE_CHECKS) {
    assert(evidence.checks?.[check] === 'passed', `Hosted acceptance is incomplete: ${check}`);
  }
  const provider = evidence.stripe;
  const order = evidence.order;
  assert(provider?.livemode === false, 'Live-mode Stripe evidence is forbidden');
  assert(/^cs_test_[A-Za-z0-9_]+$/.test(provider.sessionId || ''), 'A real Stripe test checkout session is required');
  assert(/^pi_[A-Za-z0-9_]+$/.test(provider.paymentIntentId || ''), 'A Stripe payment intent reference is required');
  assert(provider.status === 'complete' && provider.paymentStatus === 'paid', 'Stripe did not confirm a completed paid checkout');
  assert(Number.isSafeInteger(provider.amountMinor) && provider.amountMinor >= 50, 'Provider amount must be an integer in minor units');
  assert(/^[a-z]{3}$/.test(provider.currency || ''), 'Provider currency is invalid');
  assert(/^[a-f0-9]{24}$/i.test(order?.id || ''), 'A persisted order reference is required');
  assert(['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(order.paymentStatus), 'Order has not been settled by the payment webhook');
  for (const key of ['sessionId', 'paymentIntentId', 'amountMinor', 'currency']) {
    assert(order[key] === provider[key], `Order and Stripe ${key} do not match`);
  }
  // Artifacts must never turn credentials, browser tokens or full Stripe payloads into retained logs.
  const serialized = JSON.stringify(evidence);
  assert(!/(?:[sr]k_(?:test|live)_|whsec_|Bearer\s|eyJ[A-Za-z0-9_-]+\.eyJ)/.test(serialized), 'Acceptance evidence contains a credential-like value');
  return evidence;
}

export async function loadAcceptance(file, expected) {
  return verifyAcceptance(JSON.parse(await readFile(file, 'utf8')), expected);
}

export function verifyApiRelease(value, { commit, environment, paymentsEnabled }) {
  assert(value?.status === 'ready', 'API is not ready');
  assert(value.commit === requireSha(commit), 'API release commit does not match the intended source');
  assert(value.environment === environment, 'API environment does not match the deployment target');
  assert(value.paymentsEnabled === paymentsEnabled, 'API payment switch differs from the authorized state');
  assert(['test', 'disabled'].includes(value.stripeMode), 'Release would expose live-mode Stripe payments');
  return value;
}
