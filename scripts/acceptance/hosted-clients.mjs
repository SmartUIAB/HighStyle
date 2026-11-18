import { setTimeout as delay } from 'node:timers/promises';

export class AcceptanceError extends Error {}
export function ensure(condition, message) {
  if (!condition) throw new AcceptanceError(message);
}

export async function poll(read, predicate, label, { timeout = 120_000, interval = 2_000 } = {}) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await read();
    if (predicate(value)) return value;
    await delay(interval);
  }
  throw new AcceptanceError(`Hosted acceptance timed out: ${label}`);
}

export function hostedClients(config) {
  async function api(query, variables = {}, token, { allowErrors = false } = {}) {
    const response = await fetch(`${config.apiOrigin}/graphql`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30_000),
      headers: { 'Content-Type': 'application/json', Origin: config.storefrontOrigin, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ query, variables }),
    });
    ensure(response.ok, `Staging GraphQL HTTP request failed (${response.status})`);
    const result = await response.json();
    if (!allowErrors) ensure(!result.errors?.length, `Staging GraphQL operation failed (${result.errors?.[0]?.extensions?.code || 'unknown'})`);
    return result;
  }
  async function stripe(path, { method = 'GET', fields, idempotencyKey } = {}) {
    ensure(/^\/v1\//.test(path), 'Stripe acceptance request must use its fixed API origin');
    const response = await fetch(`https://api.stripe.com${path}`, {
      method, redirect: 'error', signal: AbortSignal.timeout(30_000),
      headers: { Authorization: `Bearer ${config.stripeKey}`, ...(fields ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}), ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
      ...(fields ? { body: new URLSearchParams(fields) } : {}),
    });
    ensure(response.ok, `Stripe test API request failed (${response.status}); inspect the test dashboard without exposing credentials`);
    const result = await response.json();
    ensure(result.livemode !== true, 'A live Stripe object was returned; acceptance stopped');
    return result;
  }
  async function checkout(customer, cartId) {
    return api(`mutation HostedCheckout($customerId:ID!,$cartId:ID!,$shippingAddress:ShippingAddressInput!){AddOrder(customerId:$customerId,cartId:$cartId,shippingAddress:$shippingAddress,locale:"en"){order paymentIntentClientSecret}}`, {
      customerId: customer.id, cartId,
      shippingAddress: { street: '1 Test Street', city: 'Gothenburg', state: 'Vastra Gotaland', postalCode: '41101', country: 'Sweden' },
    }, customer.token, { allowErrors: true });
  }
  async function cancel(customer, orderId) {
    return api('mutation HostedCancel($orderId:ID!){cancelCheckout(orderId:$orderId){id paymentStatus orderStatus}}', { orderId }, customer.token);
  }
  return { api, stripe, checkout, cancel };
}
