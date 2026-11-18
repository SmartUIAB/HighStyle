import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { GET_CART } from "../../../../../GraphQL/Queries/cartQueries";
import { GET_MY_ORDERS } from "../../../../../GraphQL/Queries/orderQueries";
import { DELETE_CART_ITEM, UPDATE_CART_ITEM } from "../../../../../GraphQL/Mutations/cartMutations";
import { CANCEL_CHECKOUT, CREATE_ORDER } from "../../../../../GraphQL/Mutations/orderMutations";
import LocalLink from "../../../../../components/LocalLink";
import Icon from "../../../../../components/storefront/Icon";
import useStoreText from "../../../../../components/storefront/useStoreText";
import useCustomer, { refreshCart } from "../../../../../components/storefront/useCustomer";
import { checkoutDestination, formatMoney, imageSource } from "../../../../../components/storefront/commerce.mjs";
import { clearCheckoutRecovery, hasReservedCheckout, readCheckoutRecovery, writeCheckoutRecovery } from "../../../../../components/storefront/checkoutRecovery.mjs";

const emptyAddress = { street: "", city: "", state: "", postalCode: "", country: "" };
const fields = [["street", "street-address"], ["city", "address-level2"], ["state", "address-level1"], ["postalCode", "postal-code"], ["country", "country-name"]];

export default function CartPage() {
  const { customer, ready } = useCustomer();
  const { text, locale } = useStoreText();
  const router = useRouter();
  const [address, setAddress] = useState(emptyAddress);
  const [addressReady, setAddressReady] = useState(false);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [recoveryOrderId, setRecoveryOrderId] = useState(null);
  const pending = useRef(false);
  const [updateCart] = useMutation(UPDATE_CART_ITEM);
  const [deleteCart] = useMutation(DELETE_CART_ITEM);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [cancelCheckout] = useMutation(CANCEL_CHECKOUT);
  const { data, loading, error, refetch } = useQuery(GET_CART, {
    variables: { userId: customer?.id || "000000000000000000000000" },
    skip: !customer?.id,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });
  const returnOrderId = typeof router.query.checkout_order === "string" && /^[a-f0-9]{24}$/i.test(router.query.checkout_order) ? router.query.checkout_order : null;
  const checkoutOrder = returnOrderId || recoveryOrderId;
  const recovery = useQuery(GET_MY_ORDERS, {
    variables: { customerId: customer?.id || "000000000000000000000000", orderId: checkoutOrder },
    skip: !customer?.id || !checkoutOrder,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });
  const previousOrder = recovery.data?.GetMyOrder?.find(order => order.id === checkoutOrder);
  const activeCheckout = hasReservedCheckout(previousOrder);
  useEffect(() => {
    if (!customer?.id) { setRecoveryOrderId(null); return; }
    try { setRecoveryOrderId(readCheckoutRecovery(window.sessionStorage, customer.id)); } catch (_) {}
  }, [customer?.id]);
  useEffect(() => {
    if (!customer?.id || !checkoutOrder || recovery.loading || recovery.error || !recovery.data) return;
    if (activeCheckout) return;
    try { clearCheckoutRecovery(window.sessionStorage, customer.id, checkoutOrder); } catch (_) {}
    setRecoveryOrderId(null);
    if (returnOrderId) router.replace(`/${locale}/page/account/cart`, undefined, { shallow: true }).catch(() => {});
  }, [customer?.id, checkoutOrder, activeCheckout, recovery.loading, recovery.error, recovery.data, returnOrderId, locale, router]);
  useEffect(() => {
    const restore = event => {
      if (!event.persisted) return;
      pending.current = false;
      setBusy(null);
      setActionError("");
      if (!customer?.id) return;
      try { setRecoveryOrderId(previous => readCheckoutRecovery(window.sessionStorage, customer.id) || previous); } catch (_) {}
      refetch().catch(() => {});
      if (checkoutOrder) recovery.refetch().catch(() => {});
      refreshCart();
    };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, [customer?.id, checkoutOrder, refetch, recovery.refetch]);
  useEffect(() => {
    if (!customer?.id) return;
    try {
      const stored = JSON.parse(sessionStorage.getItem("highstyle:delivery") || "null");
      if (stored?.customerId === customer.id) setAddress(Object.fromEntries(fields.map(([key]) => [key, typeof stored.address?.[key] === "string" ? stored.address[key].slice(0, 200) : ""])));
    } catch (_) {}
    setAddressReady(true);
  }, [customer?.id]);
  useEffect(() => {
    if (!customer?.id || !addressReady) return;
    try { sessionStorage.setItem("highstyle:delivery", JSON.stringify({ customerId: customer.id, address })); } catch (_) {}
  }, [address, addressReady, customer?.id]);
  const cart = data?.getCart;
  const items = cart?.products || [];
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const checkoutEnabled = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";
  const mutateLine = async (item, quantity) => {
    if (pending.current || checkoutOrder || !cart?.id) return;
    pending.current = true;
    setBusy(item._id);
    setActionError("");
    setNotice("");
    try {
      if (quantity === 0) await deleteCart({ variables: { cartId: cart.id, productId: item._id } });
      else await updateCart({ variables: { cartId: cart.id, productId: item._id, newQuantity: quantity } });
      await refetch();
      refreshCart();
      setNotice(text(quantity === 0 ? "itemRemoved" : "cartUpdated"));
    } catch (_) { setActionError(text("updateError")); }
    finally { pending.current = false; setBusy(null); }
  };
  const beginCheckout = async event => {
    event.preventDefault();
    if (pending.current || checkoutOrder || !checkoutEnabled || !items.length || !cart?.id || error) return;
    if (fields.some(([key]) => !address[key].trim())) { setActionError(text("addressRequired")); return; }
    pending.current = true;
    setBusy("checkout");
    setActionError("");
    try {
      const result = await createOrder({ variables: { customerId: customer.id, cartId: cart.id, shippingAddress: Object.fromEntries(fields.map(([key]) => [key, address[key].trim()])), locale } });
      const destination = checkoutDestination(result.data?.AddOrder?.paymentIntentClientSecret);
      if (!destination) throw new Error("Invalid checkout destination");
      const orderId = result.data?.AddOrder?.order;
      if (typeof orderId === "string" && /^[a-f0-9]{24}$/i.test(orderId)) {
        setRecoveryOrderId(orderId);
        try { writeCheckoutRecovery(window.sessionStorage, customer.id, orderId); } catch (_) {}
        // Keep the recovery reference in the existing history entry too: browser
        // Back must work even when Safari denies sessionStorage or reloads the page.
        await router.replace({ pathname: router.pathname, query: { ...router.query, checkout_order: orderId } }, undefined, { shallow: true, scroll: false });
      }
      window.location.assign(destination);
    } catch (_) {
      setActionError(text("checkoutError"));
      pending.current = false;
      setBusy(null);
    }
  };
  const cancelPrevious = async () => {
    if (pending.current || !checkoutOrder || !activeCheckout) return;
    pending.current = true;
    setBusy("cancel");
    setActionError("");
    try {
      await cancelCheckout({ variables: { orderId: checkoutOrder } });
      try { clearCheckoutRecovery(window.sessionStorage, customer.id, checkoutOrder); } catch (_) {}
      setRecoveryOrderId(null);
      setNotice(text("checkoutCancelled"));
      await router.replace(`/${locale}/page/account/cart`, undefined, { shallow: true });
      await refetch();
      refreshCart();
    } catch (_) { setActionError(text("cancelError")); recovery.refetch().catch(() => {}); }
    finally { pending.current = false; setBusy(null); }
  };
  if (!ready || (loading && !data && customer)) return <div className="hs-container hs-empty" role="status"><span className="hs-spinner" />{text("bag")}…</div>;
  if (!customer) return <section className="hs-container hs-empty hs-page-space"><Icon name="bag" size={48} /><h1>{text("signInBag")}</h1><p>{text("signInBagBody")}</p><LocalLink href={`/page/account/login?returnTo=${encodeURIComponent(`/${locale}/page/account/cart`)}`} className="hs-button">{text("signIn")}<Icon name="arrow" /></LocalLink></section>;
  return <section className="hs-container hs-page-space hs-cart">
    <div className="hs-page-heading"><span className="hs-eyebrow">HIGHSTYLE / {text("bag")}</span><h1>{text("cartIntro")}</h1><p>{text("cartBody")}</p></div>
    <ol className="hs-steps" aria-label={text("checkout")}><li aria-current="step"><span>1</span>{text("orderReview")}</li><li><span>2</span>{text("delivery")}</li><li><span>3</span>{text("payment")}</li></ol>
    <div aria-live="polite">{notice && <p className="hs-notice hs-notice-success"><Icon name="check" />{notice}</p>}</div>
    {actionError && <p className="hs-notice hs-notice-error" role="alert"><Icon name="info" />{actionError}</p>}
    {checkoutOrder && recovery.error && <div className="hs-notice" role="alert"><Icon name="info" /><div><p>{text("confirmationError")}</p><button type="button" className="hs-text-button" onClick={() => recovery.refetch()}>{text("checkStatus")}</button></div></div>}
    {checkoutOrder && !recovery.error && recovery.loading && <p className="hs-notice" role="status">{text("confirming")}</p>}
    {checkoutOrder && activeCheckout && <div className="hs-notice hs-cancel-notice"><Icon name="info" /><div><strong>{text("cancelled")}</strong><p>{text("cancelledBody")}</p><button type="button" className="hs-text-button" disabled={!!busy} onClick={cancelPrevious}>{text(busy === "cancel" ? "cancelling" : "cancelCheckout")}</button></div></div>}
    {error ? <div className="hs-empty" role="alert"><p>{text("cartError")}</p><button className="hs-button hs-button-outline" type="button" onClick={() => refetch()}>{text("retry")}</button><LocalLink href="/page/account/login" className="hs-text-button">{text("signIn")}</LocalLink></div> : items.length === 0 ? <div className="hs-empty"><Icon name="bag" size={50} /><h2>{text("emptyBag")}</h2><p>{text("emptyBagBody")}</p><LocalLink href="/#collection" className="hs-button">{text("explore")}<Icon name="arrow" /></LocalLink></div> : <form data-testid="cart-checkout" className="hs-checkout-grid" onSubmit={beginCheckout} aria-busy={!!busy}>
      <div>
        <div className="hs-card hs-cart-items"><div className="hs-card-heading"><h2>{text("bag")}</h2><span>{count} {text("items")}</span></div>
          {items.map(item => <article className="hs-cart-item" key={item._id}>
            <LocalLink href={`/product-details/${item.ProductID}`} className="hs-cart-image"><img src={imageSource(item.image)} alt={item.title} width="112" height="140" /></LocalLink>
            <div className="hs-cart-item-details"><h3><LocalLink href={`/product-details/${item.ProductID}`}>{item.title}</LocalLink></h3>{(item.size || item.color) && <p>{[item.size, item.color].filter(Boolean).join(" / ")}</p>}<span className="hs-unit-price">{formatMoney(item.price, locale)}</span><div className="hs-cart-item-controls"><div className="hs-quantity"><button type="button" aria-label={`${text("decrease")}: ${item.title}`} disabled={!!busy || loading || !!checkoutOrder || item.quantity <= 1} onClick={() => mutateLine(item, item.quantity - 1)}><Icon name="minus" size={16} /></button><output aria-label={`${text("quantity")}: ${item.title}`}>{item.quantity}</output><button type="button" aria-label={`${text("increase")}: ${item.title}`} disabled={!!busy || loading || !!checkoutOrder || item.quantity >= 99} onClick={() => mutateLine(item, item.quantity + 1)}><Icon name="plus" size={16} /></button></div><button type="button" className="hs-remove" aria-label={`${text("remove")}: ${item.title}`} disabled={!!busy || loading || !!checkoutOrder} onClick={() => mutateLine(item, 0)}><Icon name="remove" size={17} /><span>{text("remove")}</span></button></div></div>
            <strong className="hs-line-total">{formatMoney(item.totalAmount, locale)}</strong>
          </article>)}
          <p className="hs-small hs-stock-note"><Icon name="info" size={17} />{text("latestPrice")}</p>
        </div>
        <section className="hs-card hs-address" aria-labelledby="delivery-heading"><div className="hs-card-heading"><h2 id="delivery-heading">{text("address")}</h2><Icon name="box" /></div><p>{text("addressBody")}</p><div className="hs-form-grid">{fields.map(([key, autoComplete]) => <label key={key} className={key === "street" ? "hs-field hs-field-wide" : "hs-field"}><span>{text(key)} <span aria-hidden="true">*</span></span><input name={key} autoComplete={autoComplete} value={address[key]} onChange={event => setAddress(previous => ({ ...previous, [key]: event.target.value }))} required maxLength={200} disabled={busy === "checkout"} /></label>)}</div></section>
        <LocalLink href="/#collection" className="hs-continue"><Icon name="arrow" size={18} />{text("resume")}</LocalLink>
      </div>
      <aside className="hs-order-summary hs-card"><span className="hs-eyebrow">HIGHSTYLE</span><h2>{text("summary")}</h2><dl><div><dt>{text("subtotal")} ({count})</dt><dd>{formatMoney(cart.totalAmount, locale)}</dd></div><div className="hs-summary-total"><dt>{text("total")}</dt><dd>{formatMoney(cart.totalAmount, locale)}</dd></div></dl><p className="hs-small">{text("paymentTotal")}</p>
        {!checkoutEnabled && <p className="hs-notice" role="status">{text("checkoutUnavailable")}</p>}
        {process.env.NEXT_PUBLIC_PAYMENT_MODE === "test" && <p className="hs-test-note">{text("testCheckout")}</p>}
        <button data-testid="checkout-submit" type="submit" className="hs-button hs-button-wide" disabled={!checkoutEnabled || !!busy || loading || !!checkoutOrder}><span>{text(busy === "checkout" ? "checkoutBusy" : "checkout")}</span>{busy === "checkout" ? <span className="hs-spinner" /> : <Icon name="arrow" size={20} />}</button><p className="hs-secure-note"><Icon name="lock" size={16} /><span>{text("securePayment")}</span></p><p className="hs-small">{text("detailsSafe")}</p>
      </aside>
    </form>}
  </section>;
}
