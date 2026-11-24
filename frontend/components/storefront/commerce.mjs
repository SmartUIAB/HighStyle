export const supportedLocales = ["en", "ar", "sv", "es", "fr", "pt"];

export function localeOf(value) {
  return supportedLocales.includes(value) ? value : "en";
}

export function documentLocale(ctx = {}) {
  if (supportedLocales.includes(ctx.query?.lng)) return ctx.query.lng;
  for (const path of [ctx.asPath, ctx.req?.url]) {
    if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) continue;
    const first = path.split(/[/?#]/)[1];
    if (supportedLocales.includes(first)) return first;
  }
  return "en";
}

export function localizedPath(path = "/", locale = "en") {
  const language = localeOf(locale);
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return `/${language}`;
  const first = path.split(/[/?#]/)[1];
  return supportedLocales.includes(first) ? path : `/${language}${path === "/" ? "" : path}`;
}

export function safeReturnPath(value, locale = "en") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return localizedPath("/", locale);
  try {
    const url = new URL(value, "https://highstyle.invalid");
    if (url.origin !== "https://highstyle.invalid") return localizedPath("/", locale);
    return localizedPath(url.pathname + url.search + url.hash, locale);
  } catch (_) {
    return localizedPath("/", locale);
  }
}

export function checkoutDestination(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com" || url.port || url.username || url.password || !/^\/(?:c\/)?pay\//.test(url.pathname)) return null;
    return url.href;
  } catch (_) {
    return null;
  }
}

export function discountedAmount(product) {
  const price = Number(product?.price);
  const discount = Number(product?.discount || 0);
  if (!Number.isFinite(price) || price < 0 || !Number.isFinite(discount) || discount < 0 || discount > 100) return null;
  return Math.round(Math.round((price + Number.EPSILON) * 100) * (100 - discount) / 100) / 100;
}

export function formatMoney(amount, locale = "en", currency = "USD") {
  if (amount === null || !Number.isFinite(Number(amount))) return "—";
  return new Intl.NumberFormat(localeOf(locale), { style: "currency", currency, currencyDisplay: "code", minimumFractionDigits: 2 }).format(Number(amount));
}

export function imageSource(path, origin = process.env.NEXT_PUBLIC_API_KEY || "") {
  if (typeof path !== "string" || !path.trim()) return "/assets/images/icon-empty-cart.png";
  if (/^https:\/\//i.test(path)) return path;
  if (path.startsWith("/assets/")) return path;
  if (!path.startsWith("/uploads/") || path.includes("..")) return "/assets/images/icon-empty-cart.png";
  return `${origin.replace(/\/$/, "")}${path}`;
}

export function availableUnits(product, kind = "physical") {
  if (product?.status !== "Available") return 0;
  if (kind === "digital" || product?.__typename === "DigitalProduct") return 99;
  const quantity = product?.availableQuantity;
  return Number.isSafeInteger(quantity) ? Math.min(99, Math.max(0, quantity)) : 0;
}
