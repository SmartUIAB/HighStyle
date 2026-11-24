import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import CommonLayout from "../../../components/shop/common-layout";
import { GET_MY_ORDERS } from "../../../GraphQL/Queries/orderQueries";
import LocalLink from "../../../components/LocalLink";
import Icon from "../../../components/storefront/Icon";
import OrderSummary from "../../../components/storefront/OrderSummary";
import useStoreText from "../../../components/storefront/useStoreText";
import useCustomer, { refreshCart } from "../../../components/storefront/useCustomer";
import { clearCheckoutRecovery, hasReservedCheckout } from "../../../components/storefront/checkoutRecovery.mjs";

export default function OrderSuccess() {
  const { text, locale } = useStoreText();
  const router = useRouter();
  const { customer, ready } = useCustomer();
  const [timedOut, setTimedOut] = useState(false);
  const id = typeof router.query.order_id === "string" && /^[a-f0-9]{24}$/i.test(router.query.order_id) ? router.query.order_id : null;
  const { data, loading, error, refetch, startPolling, stopPolling } = useQuery(GET_MY_ORDERS, { variables: { customerId: customer?.id || "000000000000000000000000", orderId: id }, skip: !customer?.id || !id, fetchPolicy: "network-only", notifyOnNetworkStatusChange: true });
  const order = data?.GetMyOrder?.find(item => item.id === id);
  const paid = order?.paymentStatus === "PAID";
  const failed = order?.paymentStatus === "FAILED" || order?.orderStatus === "CANCELED";
  const refunded = ["REFUNDED", "PARTIALLY_REFUNDED"].includes(order?.paymentStatus);
  const pending = order?.paymentStatus === "PENDING" && !failed;
  useEffect(() => {
    setTimedOut(false);
    if (!id) return;
    const timeout = setTimeout(() => setTimedOut(true), 90_000);
    return () => clearTimeout(timeout);
  }, [id]);
  useEffect(() => {
    if (pending && !timedOut && !error) startPolling(2500);
    else stopPolling();
    return () => stopPolling();
  }, [pending, timedOut, error, startPolling, stopPolling]);
  useEffect(() => {
    if (paid) { refreshCart(); try { sessionStorage.removeItem("highstyle:delivery"); } catch (_) {} }
  }, [paid]);
  useEffect(() => {
    if (customer?.id && order && !hasReservedCheckout(order)) {
      try { clearCheckoutRecovery(window.sessionStorage, customer.id, order.id); } catch (_) {}
    }
  }, [customer?.id, order]);
  const title = paid ? "paid" : refunded ? "refunded" : failed ? "failed" : "confirming";
  const message = paid ? "paidBody" : refunded ? "refundedBody" : failed ? "failedBody" : timedOut ? "pendingLong" : "confirmingBody";
  return <CommonLayout title={text("confirmation")}><section className="hs-container hs-page-space hs-confirmation">
    {!ready || (loading && !data) ? <div className="hs-empty" role="status"><span className="hs-spinner" />{text("confirming")}</div> : !customer ? <div className="hs-empty"><Icon name="user" size={40} /><h1>{text("signIn")}</h1><LocalLink className="hs-button" href={`/page/account/login?returnTo=${encodeURIComponent(`/${locale}/page/order-success${id ? `?order_id=${id}` : ""}`)}`}>{text("signIn")}</LocalLink></div> : error ? <div className="hs-empty" role="alert"><Icon name="info" size={40} /><p>{text("confirmationError")}</p><button type="button" className="hs-button" onClick={() => refetch()}>{text("checkStatus")}</button><LocalLink href="/page/account/orders" className="hs-text-button">{text("orders")}</LocalLink></div> : !id || !order ? <div className="hs-empty"><Icon name="bag" size={40} /><h1>{text(id ? "orderNotFound" : "unknownOrder")}</h1><LocalLink className="hs-button" href="/page/account/orders">{text("orders")}</LocalLink></div> : <>
      <div className={`hs-confirmation-banner ${paid ? "hs-confirmation-success" : ""}`} aria-live="polite" data-testid="order-message"><div className="hs-confirmation-symbol">{pending && !timedOut ? <span className="hs-spinner" /> : <Icon name={paid ? "check" : "info"} size={30} />}</div><h1>{text(title)}</h1><p>{text(message)}</p></div>
      <OrderSummary order={order} />
      <div className="hs-confirmation-actions"><LocalLink className="hs-button" href={failed ? "/page/account/cart" : "/page/account/orders"}>{text(failed ? "viewBag" : "orders")}<Icon name="arrow" size={18} /></LocalLink>{pending ? <button type="button" className="hs-button hs-button-outline" onClick={() => refetch()} disabled={loading}>{text("checkStatus")}</button> : <LocalLink className="hs-button hs-button-outline" href="/#collection">{text("resume")}</LocalLink>}</div>
    </>}
  </section></CommonLayout>;
}
