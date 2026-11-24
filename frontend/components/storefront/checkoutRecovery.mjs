export const CHECKOUT_RECOVERY_KEY = "highstyle:active-checkout";
const validId = value => typeof value === "string" && /^[a-f0-9]{24}$/i.test(value);

// This reference is a navigation hint only. Payment and reservation state always
// come from a customer-authorized server read before enabling cancellation.
export function readCheckoutRecovery(storage, customerId) {
  if (!validId(customerId)) return null;
  try {
    const saved = JSON.parse(storage.getItem(CHECKOUT_RECOVERY_KEY) || "null");
    return saved?.customerId === customerId && validId(saved.orderId) ? saved.orderId : null;
  } catch (_) { return null; }
}

export function writeCheckoutRecovery(storage, customerId, orderId) {
  if (!validId(customerId) || !validId(orderId)) return false;
  try {
    storage.setItem(CHECKOUT_RECOVERY_KEY, JSON.stringify({ customerId, orderId }));
    return true;
  } catch (_) { return false; }
}

export function clearCheckoutRecovery(storage, customerId, orderId) {
  if (readCheckoutRecovery(storage, customerId) !== orderId) return;
  try { storage.removeItem(CHECKOUT_RECOVERY_KEY); } catch (_) {}
}

export function hasReservedCheckout(order) {
  return order?.paymentStatus === "PENDING" && order.inventoryStatus === "RESERVED" && order.orderStatus !== "CANCELED";
}
