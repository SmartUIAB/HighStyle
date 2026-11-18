import React from "react";
import LocalLink from "../LocalLink";
import { availableUnits, discountedAmount, formatMoney, imageSource } from "./commerce.mjs";
import useStoreText from "./useStoreText";
import Icon from "./Icon";

export default function ProductCard({ product, kind, add, busyId }) {
  const { text, locale } = useStoreText();
  const amount = discountedAmount(product);
  const available = availableUnits(product, kind) > 0 && amount !== null;
  const options = product.colors?.length > 0 || product.sizes?.length > 0;
  const path = `/product-details/${product.id}`;
  return <article className="hs-product-card" data-testid="product-card" data-product-id={product.id}>
    <LocalLink href={path} className="hs-product-photo" aria-label={`${text("details")}: ${product.title}`}>
      <img src={imageSource(product.images?.[0])} alt={product.title} width="520" height="650" loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/assets/images/icon-empty-cart.png"; }} />
      {product.discount > 0 && <span className="hs-product-badge">−{product.discount}%</span>}
      {!available && <span className="hs-unavailable-badge">{text("soldOut")}</span>}
      <span className="hs-photo-action"><Icon name="arrow" /></span>
    </LocalLink>
    <div className="hs-product-info">
      <p className="hs-product-kind">{kind === "digital" ? text("digital") : product.category?.name || text("physical")}</p>
      <h3><LocalLink href={path}>{product.title}</LocalLink></h3>
      <div className="hs-product-price"><strong>{formatMoney(amount, locale)}</strong>{product.discount > 0 && <del>{formatMoney(product.price, locale)}</del>}</div>
      {options && <p className="hs-option-note">{[product.colors?.length ? `${product.colors.length} ${text("chooseColor").toLowerCase()}` : null, product.sizes?.join(" · ")].filter(Boolean).join(" / ")}</p>}
      {options && available ? <LocalLink href={path} className="hs-button hs-button-outline hs-card-button">{text("choose")}<Icon name="arrow" size={18} /></LocalLink> : <button data-testid="add-to-cart" type="button" className="hs-button hs-button-outline hs-card-button" disabled={!available || !!busyId} onClick={() => add(product, { kind })}><span>{busyId === product.id ? text("adding") : available ? text("add") : text("soldOut")}</span><Icon name="plus" size={18} /></button>}
    </div>
  </article>;
}
