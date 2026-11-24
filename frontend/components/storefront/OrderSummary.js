import React from "react";
import { formatMoney } from "./commerce.mjs";
import useStoreText from "./useStoreText";

export function statusText(status, text) {
  const labels = { PENDING: "pending", PAID: "paidLabel", FAILED: "failedLabel", REFUNDED: "refundedLabel", PARTIALLY_REFUNDED: "partialRefund", SHIPPED: "shipped", DELIVERED: "delivered", COMPLETED: "completed", CANCELED: "canceledLabel" };
  return labels[status] ? text(labels[status]) : status;
}

export function orderDate(value, locale) {
  const milliseconds = /^\d+$/.test(String(value)) ? Number(value) : value;
  const date = new Date(milliseconds);
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date) : "—";
}

export default function OrderSummary({ order }) {
  const { text, locale } = useStoreText();
  const currency = order.currency?.toUpperCase() || "USD";
  return <div className="hs-card" data-testid="order-summary">
    <dl className="hs-order-metadata"><div><dt>{text("orderReference")}</dt><dd>{order.id}</dd></div><div><dt>{text("date")}</dt><dd>{orderDate(order.createdAt, locale)}</dd></div><div><dt>{text("paymentStatus")}</dt><dd data-testid="order-status" data-payment-status={order.paymentStatus}>{statusText(order.paymentStatus, text)}</dd></div><div><dt>{text("orderStatus")}</dt><dd>{statusText(order.orderStatus, text)}</dd></div></dl>
    <div className="hs-order-lines">{order.products.map((item, index) => <div className="hs-order-line" key={`${item.productId}-${index}`}><span>{item.quantity} × {item.title || item.productId}{(item.size || item.color) && <small> · {[item.size, item.color].filter(Boolean).join(" / ")}</small>}</span>{item.totalAmountMinor != null && <strong>{formatMoney(item.totalAmountMinor / 100, locale, currency)}</strong>}</div>)}<div className="hs-order-line"><strong>{text("total")}</strong><strong>{formatMoney(order.finalTotal, locale, currency)}</strong></div></div>
    {order.shippingAddress && <section className="hs-order-address"><h2>{text("address")}</h2><p>{order.shippingAddress.street}<br />{[order.shippingAddress.postalCode, order.shippingAddress.city].filter(Boolean).join(" ")}<br />{[order.shippingAddress.state, order.shippingAddress.country].filter(Boolean).join(", ")}</p></section>}
  </div>;
}
