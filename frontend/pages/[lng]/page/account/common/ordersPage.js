import React from "react";
import { useQuery } from "@apollo/client";
import { GET_MY_ORDERS } from "../../../../../GraphQL/Queries/orderQueries";
import LocalLink from "../../../../../components/LocalLink";
import Icon from "../../../../../components/storefront/Icon";
import { orderDate, statusText } from "../../../../../components/storefront/OrderSummary";
import { formatMoney } from "../../../../../components/storefront/commerce.mjs";
import useCustomer from "../../../../../components/storefront/useCustomer";
import useStoreText from "../../../../../components/storefront/useStoreText";

export default function OrdersPage() {
  const { text, locale } = useStoreText();
  const { customer, ready } = useCustomer();
  const { data, loading, error, refetch } = useQuery(GET_MY_ORDERS, { variables: { customerId: customer?.id || "000000000000000000000000" }, skip: !customer?.id, fetchPolicy: "network-only", notifyOnNetworkStatusChange: true });
  return <section className="hs-container hs-page-space"><div className="hs-section-title"><div className="hs-page-heading"><span className="hs-eyebrow">HIGHSTYLE / {text("account")}</span><h1>{text("orders")}</h1></div>{customer && <button type="button" className="hs-icon-button hs-button-outline" disabled={loading} onClick={() => refetch()} aria-label={text("refresh")}><Icon name="refresh" /></button>}</div>
    {!ready || (loading && !data && customer) ? <div className="hs-empty" role="status"><span className="hs-spinner" /></div> : !customer ? <div className="hs-empty"><Icon name="user" size={42} /><LocalLink href={`/page/account/login?returnTo=${encodeURIComponent(`/${locale}/page/account/orders`)}`} className="hs-button">{text("signIn")}</LocalLink></div> : error ? <div className="hs-empty" role="alert"><p>{text("confirmationError")}</p><button type="button" className="hs-button" onClick={() => refetch()}>{text("retry")}</button></div> : !data?.GetMyOrder?.length ? <div className="hs-empty"><Icon name="bag" size={42} /><h2>{text("noOrders")}</h2><LocalLink className="hs-button" href="/#collection">{text("explore")}</LocalLink></div> : <div className="hs-orders-list">{data.GetMyOrder.map(order => <article className="hs-card" key={order.id}><div><span className="hs-small">{orderDate(order.createdAt, locale)}</span><h2>{text("orderReference")}: {order.id}</h2><p>{statusText(order.paymentStatus, text)} · {statusText(order.orderStatus, text)}</p></div><strong className="hs-order-amount">{formatMoney(order.finalTotal, locale, order.currency?.toUpperCase() || "USD")}</strong><LocalLink href={`/page/order-success?order_id=${order.id}`} className="hs-button hs-button-outline">{text("viewOrder")}<Icon name="arrow" size={18} /></LocalLink></article>)}</div>}
  </section>;
}
