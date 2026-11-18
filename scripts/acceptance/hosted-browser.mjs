import { pathToFileURL } from 'node:url';
import { ensure, poll } from './hosted-clients.mjs';

export async function browserModule(modulePath) {
  try { return await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href); }
  catch { throw new Error('Playwright module is unavailable; install the pinned package and all three browser engines'); }
}

async function contextFor(engine, config, { mobile = false } = {}) {
  const chromiumPath = engine.name() === 'chromium' ? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE : undefined;
  const browser = await engine.launch({ headless: true, ...(chromiumPath ? { executablePath: chromiumPath } : {}) });
  const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1365, height: 900 }, locale: 'en-US', ...(mobile ? { isMobile: true, hasTouch: true } : {}) });
  if (config.vercelBypass) {
    await context.route(`${config.storefrontOrigin}/**`, async route => {
      // Scope the bypass to this one staging origin; never send it to Stripe.
      await route.continue({ headers: { ...route.request().headers(), 'x-vercel-protection-bypass': config.vercelBypass } });
    });
  }
  const page = await context.newPage();
  page.setDefaultTimeout(20_000);
  const failures = [];
  page.on('pageerror', () => { if (page.url().startsWith(`${config.storefrontOrigin}/`)) failures.push('uncaught-page-error'); });
  page.on('response', response => { if ([config.storefrontOrigin, config.apiOrigin].includes(new URL(response.url()).origin) && response.status() >= 500) failures.push('application-server-error'); });
  return { browser, context, page, failures };
}

async function shopJourney(page, config, customer, product) {
  await page.goto(`${config.storefrontOrigin}/en/page/account/login`, { waitUntil: 'domcontentloaded' });
  const loginForm = page.getByTestId('login-form');
  await loginForm.locator('input[type="email"]').fill(customer.email);
  await loginForm.locator('input[type="password"]').fill(customer.password);
  await loginForm.locator('button[type="submit"]').click();
  await page.waitForURL(url => url.origin === config.storefrontOrigin && !url.pathname.includes('/login'));
  await page.goto(`${config.storefrontOrigin}/en/product-details/${product._id}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('add-to-cart').waitFor({ state: 'visible' });
  for (const options of await page.locator('fieldset.hs-options').all()) await options.locator('button').first().click();
  await page.getByTestId('add-to-cart').click();
  await poll(async () => page.locator('.hs-count').first().textContent().catch(() => ''), value => Number(value) >= 1, 'cart updated after adding product', { timeout: 20_000 });
  await page.goto(`${config.storefrontOrigin}/en/page/account/cart`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('checkout-submit').waitFor({ state: 'visible' });
  ensure((await page.locator('body').innerText()).includes(product.title), 'The added product was not shown in the browser cart');
  await page.getByRole('button', { name: new RegExp(`^Increase quantity:`) }).first().click();
  await poll(() => page.locator('.hs-cart-item output').first().textContent(), value => value === '2', 'cart quantity increase', { timeout: 20_000 });
  await page.getByRole('button', { name: new RegExp(`^Decrease quantity:`) }).first().click();
  await poll(() => page.locator('.hs-cart-item output').first().textContent(), value => value === '1', 'cart quantity decrease', { timeout: 20_000 });
  for (const [field, value] of Object.entries({ street: '1 Test Street', city: 'Gothenburg', state: 'Vastra Gotaland', postalCode: '41101', country: 'Sweden' })) {
    const input = page.locator(`[name="${field}"]`);
    if (await input.evaluate(element => element.tagName === 'SELECT')) await input.selectOption({ label: value });
    else await input.fill(value);
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByTestId('cart-checkout').waitFor({ state: 'visible' });
  ensure((await page.locator('body').innerText()).includes(product.title), 'Customer session or cart did not survive a page reload');
  ensure(await page.locator('[name="street"]').inputValue() === '1 Test Street', 'Delivery address was lost after a page reload');
}

async function fillStripe(page, selectors, value, { required = true } = {}) {
  for (let attempt = 0; attempt < (required ? 20 : 1); attempt++) {
    for (const frame of page.frames()) {
      const locator = frame.locator(selectors).first();
      if (await locator.isVisible().catch(() => false)) { await locator.fill(value); return; }
    }
    await page.waitForTimeout(300);
  }
  ensure(!required, 'Stripe test Checkout field was unavailable; review the hosted test flow manually');
}

export async function payInBrowser(playwright, config, customer, product, clients) {
  const { browser, page, failures } = await contextFor(playwright.chromium, config);
  try {
    await shopJourney(page, config, customer, product);
    ensure(await page.getByTestId('checkout-submit').isEnabled(), 'Hosted checkout is disabled or its delivery form is incomplete');
    const responsePromise = page.waitForResponse(response => /\bAddOrder\b/.test(response.request().postData() || '') && response.request().method() === 'POST');
    await page.getByTestId('checkout-submit').click();
    const result = await (await responsePromise).json();
    ensure(!result.errors && result.data?.AddOrder?.order, 'Browser checkout did not create an order');
    const checkout = result.data.AddOrder;
    const url = new URL(checkout.paymentIntentClientSecret);
    ensure(url.protocol === 'https:' && url.hostname === 'checkout.stripe.com', 'Browser did not receive an official Stripe hosted Checkout URL');
    await page.waitForURL(current => current.origin === 'https://checkout.stripe.com', { timeout: 45_000 });
    const session = await clients.stripe(`/v1/checkout/sessions?limit=100`);
    const own = session.data?.find(item => item.metadata?.orderId === checkout.order);
    ensure(own?.livemode === false && own.id.startsWith('cs_test_') && own.metadata.customerId === customer.id, 'Stripe session is not the intended test customer and order');
    // This is Stripe's documented test card, never a real card or live-mode payment.
    await fillStripe(page, 'input[name="cardNumber"], #cardNumber, input[autocomplete="cc-number"]', '4242424242424242');
    await fillStripe(page, 'input[name="cardExpiry"], #cardExpiry, input[autocomplete="cc-exp"]', `12${String(new Date().getUTCFullYear() + 3).slice(-2)}`);
    await fillStripe(page, 'input[name="cardCvc"], #cardCvc, input[autocomplete="cc-csc"]', '123');
    await fillStripe(page, 'input[name="billingName"], #billingName, input[autocomplete="cc-name"]', 'HighStyle Acceptance', { required: false });
    await fillStripe(page, 'input[name="billingPostalCode"], #billingPostalCode, input[autocomplete="postal-code"]', '41101', { required: false });
    await page.getByRole('button', { name: /^(?:Pay|Betala|Payer|ادفع)(?:\s|$)/i }).click();
    await page.waitForURL(current => current.origin === config.storefrontOrigin && current.pathname.includes('/order-success') && current.searchParams.get('order_id') === checkout.order, { timeout: 90_000 });
    await poll(async () => page.getByTestId('order-status').getAttribute('data-payment-status').catch(() => ''), status => status === 'PAID', 'browser confirmation of the exact paid order');
    ensure(failures.length === 0, 'Chromium observed an application exception or server failure');
    return { orderId: checkout.order, sessionId: own.id, browserVersion: browser.version() };
  } finally { await browser.close(); }
}

export async function browserSmoke(playwright, engineName, config, customer, product, options = {}) {
  const mobile = options.mobile ?? engineName === 'webkit';
  const { browser, page, failures } = await contextFor(playwright[engineName], config, { mobile });
  try {
    await shopJourney(page, config, customer, product);
    await page.keyboard.press('Tab');
    ensure(await page.evaluate(() => document.activeElement && document.activeElement !== document.body), `${engineName} keyboard focus did not reach an interactive control`);
    if (mobile) ensure(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Mobile cart has horizontal overflow');
    await page.goto(`${config.storefrontOrigin}/ar`, { waitUntil: 'domcontentloaded' });
    await page.locator('#collection').waitFor();
    await page.getByTestId('product-card').first().waitFor({ state: 'visible' });
    await poll(() => page.evaluate(() => getComputedStyle(document.querySelector('#collection')).direction === 'rtl'), Boolean, 'hydrated Arabic catalog RTL layout', { timeout: 20_000 });
    if (mobile) ensure(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Mobile Arabic catalog has horizontal overflow');
    ensure(failures.length === 0, `${engineName} observed an application exception or server failure`);
    return { engine: engineName, version: browser.version(), viewport: mobile ? '390x844' : '1365x900', rtl: 'passed', checks: ['login', 'product-options', 'add-to-cart', 'quantity-change', 'delivery-address', 'session-and-cart-reload', 'keyboard-focus', 'rtl-layout', ...(mobile ? ['mobile-overflow'] : [])] };
  } finally { await browser.close(); }
}
