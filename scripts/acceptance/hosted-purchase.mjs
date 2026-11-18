import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { requireValue, requireSha, requireHttpsOrigin, verifyApiRelease, verifyAcceptance, REPOSITORY, REQUIRED_ACCEPTANCE_CHECKS } from '../release/evidence.mjs';
import { AcceptanceError, hostedClients, ensure, poll } from './hosted-clients.mjs';
import { stagingBrowserFixtures, stagingFixtures } from './hosted-fixtures.mjs';
import { browserModule, payInBrowser, browserSmoke } from './hosted-browser.mjs';

const smokeOnly = process.argv.includes('--browser-smoke');
const report = { schemaVersion: 1, kind: smokeOnly ? 'browser-smoke' : 'hosted-purchase', repository: REPOSITORY, environment: 'staging', stripeMode: 'test', startedAt: new Date().toISOString(), checks: Object.fromEntries(REQUIRED_ACCEPTANCE_CHECKS.map(name => [name, 'blocked'])) };
let fixtures;
function passed(name) { report.checks[name] = 'passed'; console.log(`Hosted check passed: ${name}`); }

function configuration() {
  const config = {
    apiOrigin: requireHttpsOrigin(process.env.STAGING_API_ORIGIN, 'STAGING_API_ORIGIN'),
    storefrontOrigin: requireHttpsOrigin(process.env.STAGING_STOREFRONT_ORIGIN, 'STAGING_STOREFRONT_ORIGIN'),
    stripeKey: smokeOnly ? undefined : requireValue(process.env.STAGING_STRIPE_SECRET_KEY, 'STAGING_STRIPE_SECRET_KEY'),
    webhookSecret: smokeOnly ? undefined : requireValue(process.env.STAGING_STRIPE_WEBHOOK_SECRET, 'STAGING_STRIPE_WEBHOOK_SECRET'),
    mongoUri: smokeOnly ? undefined : requireValue(process.env.STAGING_MONGODB_URI, 'STAGING_MONGODB_URI'),
    smtpOrigin: smokeOnly ? undefined : requireHttpsOrigin(process.env.STAGING_SMTP_API_ORIGIN, 'STAGING_SMTP_API_ORIGIN for mailbox delivery verification'),
    playwrightPath: requireValue(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE'),
    vercelBypass: process.env.STAGING_VERCEL_AUTOMATION_BYPASS_SECRET,
    smtpToken: process.env.STAGING_SMTP_API_TOKEN,
  };
  if (!smokeOnly) ensure(/^[sr]k_test_[A-Za-z0-9]+$/.test(config.stripeKey), 'Only a Stripe test-mode secret key may be used');
  if (!smokeOnly) ensure(/^whsec_[A-Za-z0-9]+$/.test(config.webhookSecret), 'A staging Stripe signing secret is required');
  ensure(process.env.ALLOW_STAGING_FIXTURES === 'true', 'Set ALLOW_STAGING_FIXTURES=true only for the isolated acceptance database');
  return config;
}

async function concurrentReservations(clients) {
  const product = await fixtures.product('concurrency', 1);
  const buyers = [];
  for (let index = 0; index < 8; index++) {
    const customer = await fixtures.customer(`race-${index}`);
    buyers.push({ customer, cartId: await fixtures.cart(customer, product) });
  }
  const results = await Promise.all(buyers.map(async buyer => ({ ...buyer, result: await clients.checkout(buyer.customer, buyer.cartId) })));
  const winners = results.filter(item => item.result.data?.AddOrder?.order);
  ensure(winners.length === 1, 'Concurrent hosted checkouts sold the same final unit more than once or none succeeded');
  ensure(results.filter(item => item.result.errors?.[0]?.extensions?.code === 'CONFLICT').length === buyers.length - 1, 'Oversold requests were not rejected as inventory conflicts');
  const winner = winners[0];
  const orderId = winner.result.data.AddOrder.order;
  const held = await fixtures.Product.findById(product._id).lean();
  ensure(held.stockQuantity === 1 && held.reservedQuantity === 1, 'Hosted reservation counters are inconsistent');
  ensure(await fixtures.Order.countDocuments({ 'products.productId': product._id, inventoryStatus: 'RESERVED' }) === 1, 'More than one active order holds the final stock unit');
  const retried = await clients.checkout(winner.customer, winner.cartId);
  ensure(retried.data?.AddOrder?.order === orderId, 'Retrying one checkout created a different reservation');
  const afterRetry = await fixtures.Product.findById(product._id).lean();
  ensure(afterRetry.reservedQuantity === 1, 'Checkout retry reserved inventory twice');
  passed('inventoryConcurrency');
  await clients.cancel(winner.customer, orderId);
  await clients.cancel(winner.customer, orderId);
  const canceled = await fixtures.Order.findById(orderId).lean();
  const remote = await clients.stripe(`/v1/checkout/sessions/${canceled.checkoutSessionId}`);
  const released = await fixtures.Product.findById(product._id).lean();
  ensure(remote.status === 'expired' && canceled.inventoryStatus === 'RELEASED' && canceled.paymentStatus === 'FAILED', 'Cancel did not expire the provider session and release its reservation');
  ensure(released.stockQuantity === 1 && released.reservedQuantity === 0, 'Cancel or repeated cancel changed inventory incorrectly');
  passed('checkoutCancel');
}

async function sessionExpiry(clients) {
  const product = await fixtures.product('expiry', 2);
  const customer = await fixtures.customer('expiry');
  const cart = await fixtures.cart(customer, product);
  const created = await clients.checkout(customer, cart);
  ensure(created.data?.AddOrder?.order, 'Expiry fixture checkout failed');
  const order = await fixtures.Order.findById(created.data.AddOrder.order).lean();
  const expired = await clients.stripe(`/v1/checkout/sessions/${order.checkoutSessionId}/expire`, { method: 'POST', idempotencyKey: `highstyle-acceptance-expire-${fixtures.run}` });
  ensure(expired.status === 'expired' && expired.livemode === false, 'Stripe did not expire the real test checkout session');
  await poll(() => fixtures.Order.findById(order._id).lean(), value => value?.inventoryStatus === 'RELEASED' && value.paymentStatus === 'FAILED', 'hosted expiry webhook or provider reconciliation');
  const released = await fixtures.Product.findById(product._id).lean();
  ensure(released.stockQuantity === 2 && released.reservedQuantity === 0, 'Expired hosted checkout did not return precisely its reservation');
  passed('sessionExpiry');
}

async function signedWebhookAcceptance(config, clients, sessionId, order, product) {
  const event = await poll(async () => {
    const events = await clients.stripe('/v1/events?type=checkout.session.completed&limit=100');
    return events.data?.find(item => item.data?.object?.id === sessionId);
  }, value => !!value, 'original Stripe checkout event');
  ensure(event.livemode === false && event.data.object.metadata?.orderId === String(order._id), 'Provider event does not describe this test order');
  // Verify automatic provider delivery BEFORE any replay. A manual signature cannot substitute for it.
  await poll(() => fixtures.Event.findById(event.id).lean(), value => !!value, 'automatic signed Stripe webhook delivery');
  const before = await fixtures.Product.findById(product._id).lean();
  const payload = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac('sha256', config.webhookSecret).update(`${timestamp}.${payload}`).digest('hex');
  const url = `${config.apiOrigin}/webhook`;
  const invalid = await fetch(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${timestamp},v1=${'0'.repeat(64)}` }, body: payload });
  ensure(invalid.status === 400, 'Webhook accepted an invalid signature');
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await fetch(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(20_000), headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${timestamp},v1=${signature}` }, body: payload });
    ensure(response.ok, 'Replay of the original signed Stripe test event failed');
  }
  const after = await fixtures.Product.findById(product._id).lean();
  ensure(before.stockQuantity === after.stockQuantity && before.reservedQuantity === after.reservedQuantity, 'Duplicate webhook changed inventory twice');
  ensure(await fixtures.Transaction.countDocuments({ order: order._id }) === 1 && await fixtures.Outbox.countDocuments({ order: order._id }) === 1, 'Duplicate webhook created an extra transaction or receipt');
  passed('webhookIdempotency');
}

async function receiptDelivery(config, customer, order) {
  await poll(() => fixtures.Outbox.findOne({ order: order._id }).lean(), value => value?.status === 'sent', 'hosted receipt outbox dispatch');
  await poll(async () => {
    const response = await fetch(`${config.smtpOrigin}/api/v1/search?query=${encodeURIComponent(`to:${customer.email}`)}`, { redirect: 'error', signal: AbortSignal.timeout(15_000), headers: config.smtpToken ? { Authorization: `Bearer ${config.smtpToken}` } : {} });
    ensure(response.ok, 'Cannot verify the dedicated staging receipt mailbox');
    const results = await response.json();
    for (const message of results.messages || []) {
      const detail = await fetch(`${config.smtpOrigin}/api/v1/message/${encodeURIComponent(message.ID)}`, { redirect: 'error', signal: AbortSignal.timeout(15_000), headers: config.smtpToken ? { Authorization: `Bearer ${config.smtpToken}` } : {} });
      ensure(detail.ok, 'Cannot read the dedicated staging receipt');
      const body = await detail.json();
      if (`${body.Text || ''} ${body.HTML || ''}`.includes(String(order._id))) return true;
    }
    return false;
  }, Boolean, 'receipt visible in the isolated test mailbox');
  passed('receiptDelivery');
}

async function refundAcceptance(clients, payment, product) {
  const before = await fixtures.Product.findById(product._id).lean();
  const partial = Math.max(1, Math.floor(payment.amount_total / 2));
  const first = await clients.stripe('/v1/refunds', { method: 'POST', fields: { payment_intent: payment.payment_intent, amount: String(partial) }, idempotencyKey: `highstyle-acceptance-partial-${fixtures.run}` });
  ensure(first.status === 'succeeded', 'Stripe test partial refund did not succeed');
  await poll(() => fixtures.Order.findOne({ checkoutSessionId: payment.id }).lean(), value => value?.paymentStatus === 'PARTIALLY_REFUNDED' && value.refundedAmountMinor === partial, 'partial refund webhook reconciliation');
  const remainder = await clients.stripe('/v1/refunds', { method: 'POST', fields: { payment_intent: payment.payment_intent, amount: String(payment.amount_total - partial) }, idempotencyKey: `highstyle-acceptance-full-${fixtures.run}` });
  ensure(remainder.status === 'succeeded', 'Stripe test final refund did not succeed');
  const order = await poll(() => fixtures.Order.findOne({ checkoutSessionId: payment.id }).lean(), value => value?.paymentStatus === 'REFUNDED' && value.refundedAmountMinor === payment.amount_total, 'full refund webhook reconciliation');
  const after = await fixtures.Product.findById(product._id).lean();
  ensure(after.stockQuantity === before.stockQuantity && after.reservedQuantity === before.reservedQuantity, 'Financial refund incorrectly restocked an unreturned physical product');
  ensure(await fixtures.Transaction.countDocuments({ order: order._id }) === 1, 'Refund duplicated the original financial transaction');
  passed('refund');
  return order;
}

async function run() {
  requireValue(process.env.HOSTED_ACCEPTANCE_OUTPUT, 'HOSTED_ACCEPTANCE_OUTPUT');
  const config = configuration();
  const localHead = requireSha(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim());
  const commit = requireSha(process.env.EXPECTED_SHA || localHead);
  const sourceTree = requireSha(execFileSync('git', ['rev-parse', `${commit}^{tree}`], { encoding: 'utf8' }).trim(), 'Source tree');
  if (!smokeOnly) {
    ensure(commit === localHead, 'Full hosted acceptance must run from the exact intended commit');
    const dirty = execFileSync('git', ['status', '--porcelain', '--untracked-files=all', '--', 'API', 'frontend', 'backend', 'scripts/acceptance', 'scripts/release'], { encoding: 'utf8' }).trim();
    ensure(!dirty, 'Hosted acceptance must execute committed reviewed application and test source, including new files');
  }
  Object.assign(report, { commit, sourceTree, apiOrigin: config.apiOrigin, storefrontOrigin: config.storefrontOrigin });
  const health = await fetch(`${config.apiOrigin}/health/release`, { redirect: 'error', signal: AbortSignal.timeout(15_000), cache: 'no-store' });
  ensure(health.ok, 'Staging API release identity is unavailable');
  const release = await health.json();
  ensure(typeof release.paymentsEnabled === 'boolean', 'Staging payment policy is missing');
  verifyApiRelease(release, { commit, environment: 'staging', paymentsEnabled: smokeOnly ? release.paymentsEnabled : true });
  const clients = hostedClients(config);
  const playwright = await browserModule(config.playwrightPath);
  if (smokeOnly) {
    fixtures = await stagingBrowserFixtures(clients);
    const product = await fixtures.product('browser-smoke', 5);
    report.browserResults = [];
    for (const [engine, check] of [['chromium', 'browserChromium'], ['firefox', 'browserFirefox'], ['webkit', 'browserWebkit']]) {
      report.browserResults.push(await browserSmoke(playwright, engine, config, await fixtures.customer(engine), product));
      passed(check);
    }
    passed('mobileViewport'); passed('rtl');
    report.finishedAt = new Date().toISOString(); report.outcome = 'browser-smoke-passed';
    return;
  }
  const endpoints = await clients.stripe('/v1/webhook_endpoints?limit=100');
  ensure(endpoints.data?.some(endpoint => endpoint.url === `${config.apiOrigin}/webhook` && endpoint.status === 'enabled' && endpoint.livemode === false && (endpoint.enabled_events.includes('*') || ['checkout.session.completed', 'checkout.session.expired', 'charge.refunded'].every(type => endpoint.enabled_events.includes(type)))), 'Stripe test webhook endpoint is missing, disabled or does not cover the required event types');
  fixtures = await stagingFixtures(config, clients);
  await concurrentReservations(clients);
  await sessionExpiry(clients);
  const product = await fixtures.product('browser', 5);
  const customer = await fixtures.customer('browser');
  const created = await payInBrowser(playwright, config, customer, product, clients);
  const payment = await clients.stripe(`/v1/checkout/sessions/${created.sessionId}`);
  ensure(payment.livemode === false && payment.status === 'complete' && payment.payment_status === 'paid' && payment.amount_total === 1250, 'Real Stripe test Checkout was not paid for the expected amount');
  let order = await poll(() => fixtures.Order.findById(created.orderId).lean(), value => value?.paymentStatus === 'PAID' && value.inventoryStatus === 'COMMITTED', 'hosted paid order and committed stock');
  const consumed = await fixtures.Product.findById(product._id).lean();
  ensure(consumed.stockQuantity === 4 && consumed.reservedQuantity === 0, 'Paid checkout did not consume exactly one reserved unit');
  passed('checkoutSuccess'); passed('browserChromium');
  await signedWebhookAcceptance(config, clients, payment.id, order, product);
  await receiptDelivery(config, customer, order);
  order = await refundAcceptance(clients, payment, product);
  for (const [engine, check] of [['firefox', 'browserFirefox'], ['webkit', 'browserWebkit']]) {
    await browserSmoke(playwright, engine, config, await fixtures.customer(engine), product);
    passed(check);
  }
  passed('mobileViewport'); passed('rtl');
  const intent = typeof payment.payment_intent === 'string' ? payment.payment_intent : payment.payment_intent?.id;
  Object.assign(report, {
    finishedAt: new Date().toISOString(),
    stripe: { sessionId: payment.id, paymentIntentId: intent, livemode: false, status: payment.status, paymentStatus: payment.payment_status, amountMinor: payment.amount_total, currency: payment.currency },
    order: { id: String(order._id), sessionId: order.checkoutSessionId, paymentIntentId: order.paymentIntentId, paymentStatus: order.paymentStatus, amountMinor: order.amountMinor, currency: order.currency },
  });
  verifyAcceptance(report, { commit, sourceTree, apiOrigin: config.apiOrigin, storefrontOrigin: config.storefrontOrigin });
}

try { await run(); }
catch (error) {
  // Never persist raw provider/browser exceptions: they can include request headers or form data.
  report.finishedAt = new Date().toISOString(); report.outcome = 'blocked-or-failed';
  const safeReason = error instanceof AcceptanceError || /^[A-Z_]+ is required$/.test(error.message) ? error.message : 'a required configuration, provider, database or browser check failed';
  console.error(`Hosted acceptance did not pass: ${safeReason}`);
  process.exitCode = 1;
} finally {
  if (fixtures) { try { await fixtures.close(); } catch { console.error('Staging fixture cleanup needs review; audit records were preserved.'); process.exitCode = 1; report.outcome = 'cleanup-needs-review'; } }
  if (process.env.HOSTED_ACCEPTANCE_OUTPUT) {
    await mkdir(dirname(process.env.HOSTED_ACCEPTANCE_OUTPUT), { recursive: true });
    await writeFile(process.env.HOSTED_ACCEPTANCE_OUTPUT, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  }
}
