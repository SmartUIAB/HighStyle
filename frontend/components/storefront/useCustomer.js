import { useEffect, useState } from "react";

export const CUSTOMER_CHANGED = "highstyle:customer-changed";
export const CART_CHANGED = "highstyle:cart-changed";

export function refreshCart() {
  window.dispatchEvent(new Event(CART_CHANGED));
}

export default function useCustomer() {
  const [customer, setCustomer] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => {
      try {
        const stored = JSON.parse(window.localStorage.getItem("customerDetail") || "null");
        setCustomer(typeof stored?.id === "string" ? stored : null);
      } catch (_) { setCustomer(null); }
      setReady(true);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(CUSTOMER_CHANGED, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CUSTOMER_CHANGED, sync);
    };
  }, []);
  return { customer, ready };
}
