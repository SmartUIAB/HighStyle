import React, { useState } from "react";
import Head from "next/head";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { PHYSICAL_PRODUCT_BY_ID, DIGITAL_PRODUCT_BY_ID } from "../../GraphQL/Queries/productQueries";
import LocalLink from "../LocalLink";
import ProductPurchase from "./ProductPurchase";
import useStoreText from "./useStoreText";
import { imageSource } from "./commerce.mjs";
import Icon from "./Icon";

function Gallery({ product }) {
  const [index, setIndex] = useState(0);
  const { text } = useStoreText();
  const images = product.images?.length ? product.images : [null];
  return <div className="hs-gallery"><div className="hs-gallery-main"><img src={imageSource(images[index])} alt={product.title} width="700" height="875" fetchPriority="high" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/assets/images/icon-empty-cart.png"; }} />{product.discount > 0 && <span className="hs-product-badge">−{product.discount}%</span>}</div>{images.length > 1 && <div className="hs-gallery-thumbs" role="group" aria-label={text("image")}>{images.map((path, imageIndex) => <button key={`${path}-${imageIndex}`} type="button" aria-pressed={index === imageIndex} aria-label={`${text("image")} ${imageIndex + 1}`} onClick={() => setIndex(imageIndex)}><img src={imageSource(path)} alt="" width="66" height="80" loading="lazy" /></button>)}</div>}</div>;
}

export default function ProductPage() {
  const router = useRouter();
  const { text } = useStoreText();
  const id = typeof router.query.id === "string" && /^[a-f0-9]{24}$/i.test(router.query.id) ? router.query.id : null;
  const physical = useQuery(PHYSICAL_PRODUCT_BY_ID, { variables: { physicalProductId: id || "" }, skip: !id, fetchPolicy: "cache-and-network" });
  const digital = useQuery(DIGITAL_PRODUCT_BY_ID, { variables: { digitalProductId: id || "" }, skip: !id, fetchPolicy: "cache-and-network" });
  const product = physical.data?.physicalProduct || digital.data?.digitalProduct;
  const loading = !router.isReady || physical.loading || digital.loading;
  return <section className="hs-container hs-page-space">
    <nav className="hs-breadcrumb" aria-label={text("shop")}><LocalLink href="/#collection">{text("shop")}</LocalLink><span aria-hidden="true">/</span><span>{product?.category?.name || text("description")}</span></nav>
    {!product && loading ? <div className="hs-empty" role="status"><span className="hs-spinner" />{text("loadingProducts")}</div> : !product ? <div className="hs-empty"><Icon name="search" size={40} /><h1>{text("productMissing")}</h1><LocalLink href="/#collection" className="hs-button">{text("backShop")}</LocalLink></div> : <><Head><title>{product.title} | HighStyle</title><meta name="description" content={product.metaDescription || product.description?.slice(0, 160) || product.title} /></Head><div className="hs-detail-grid"><Gallery key={`gallery-${product.id}`} product={product} /><ProductPurchase key={product.id} item={product} /></div></>}
  </section>;
}
