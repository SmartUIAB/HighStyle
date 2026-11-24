import React, { useState } from "react";
import { availableUnits, discountedAmount, formatMoney } from "./commerce.mjs";
import useAddToCart from "./useAddToCart";
import useStoreText from "./useStoreText";
import Icon from "./Icon";

export default function ProductPurchase({ item: product }) {
  const { text, locale } = useStoreText();
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { add, busyId, error } = useAddToCart();
  if (!product) return null;
  const digital = product.__typename === "DigitalProduct";
  const kind = digital ? "digital" : "physical";
  const stock = availableUnits(product, kind);
  const price = discountedAmount(product);
  const available = stock > 0 && price !== null;
  const submit = checkout => add(product, { quantity, color, size, checkout, kind });
  return <div className="hs-detail">
    <span className="hs-eyebrow">{product.category?.name || (digital ? text("digital") : "HIGHSTYLE")}</span>
    <h1>{product.title}</h1>
    <div className="hs-product-price"><strong>{formatMoney(price, locale)}</strong>{product.discount > 0 && <del>{formatMoney(product.price, locale)}</del>}</div>
    <p className={`hs-stock ${available ? "" : "hs-stock-unavailable"}`}><span />{text(available ? "inStock" : "soldOut")}</p>
    {product.colors?.length > 0 && <fieldset className="hs-options"><legend>{text("chooseColor")}{color ? `: ${color}` : ""}</legend><div>{product.colors.map(value => <button key={value} type="button" onClick={() => setColor(value)} aria-pressed={color === value} disabled={!!busyId}><span className="hs-color-dot" style={{ backgroundColor: value }} />{value}</button>)}</div></fieldset>}
    {product.sizes?.length > 0 && <fieldset className="hs-options"><legend>{text("chooseSize")}</legend><div>{product.sizes.map(value => <button key={value} type="button" onClick={() => setSize(value)} aria-pressed={size === value} disabled={!!busyId}>{value}</button>)}</div></fieldset>}
    <div className="hs-detail-quantity"><span>{text("quantity")}</span><div className="hs-quantity"><button type="button" onClick={() => setQuantity(previous => previous - 1)} disabled={quantity <= 1 || !!busyId || !available} aria-label={text("decrease")}><Icon name="minus" size={18} /></button><output aria-label={text("quantity")}>{quantity}</output><button type="button" onClick={() => setQuantity(previous => previous + 1)} disabled={quantity >= stock || !!busyId || !available} aria-label={text("increase")}><Icon name="plus" size={18} /></button></div></div>
    {error && <p className="hs-notice hs-notice-error" role="alert">{error}</p>}
    <div className="hs-detail-actions"><button data-testid="add-to-cart" type="button" className="hs-button hs-button-outline" disabled={!available || !!busyId} onClick={() => submit(false)}>{text(busyId ? "adding" : "add")}<Icon name="bag" size={19} /></button><button data-testid="buy-now" type="button" className="hs-button" disabled={!available || !!busyId} onClick={() => submit(true)}>{text("buyNow")}<Icon name="arrow" size={19} /></button></div>
    <p className="hs-detail-note"><Icon name="info" size={16} />{text("stockNote")}</p>
    <section className="hs-detail-description"><h2>{text("description")}</h2><p>{product.description}</p>{product.SKU && <dl><div><dt>{text("sku")}</dt><dd>{product.SKU}</dd></div></dl>}{digital && <dl>{[["Format", product.fileFormat], ["Version", product.version], ["Size", product.fileSize], ["Compatibility", product.compatibility?.join(", ")]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}</section>
  </div>;
}
