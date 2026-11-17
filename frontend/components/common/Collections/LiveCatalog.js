import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CREATE_ADD_TO_CART } from "../../../GraphQL/Mutations/cartMutations";

const LIVE_CATALOG = gql`
  query LiveCatalog {
    physicalProducts(pagination: { page: 1, limit: 12 }) {
      products { id title description price discount stockQuantity status images colors sizes }
    }
    digitalProducts(pagination: { page: 1, limit: 12 }) {
      products { id title description price discount status images }
    }
  }
`;

function imageSource(path) {
  if (typeof path !== "string" || !path.trim()) return "/assets/images/icon-empty-cart.png";
  if (/^https:\/\//i.test(path)) return path;
  if (!path.startsWith("/uploads/")) return "/assets/images/icon-empty-cart.png";
  return `${process.env.NEXT_PUBLIC_API_KEY || ""}${path}`;
}

function ProductCard({ product, kind, add }) {
  const [busy, setBusy] = useState(false);
  const discounted = Math.max(0, product.price * (1 - (product.discount || 0) / 100));
  const available = product.status === "Available" && (kind === "digital" || product.stockQuantity > 0);
  const handleAdd = async () => {
    setBusy(true);
    try { await add(product); }
    finally { setBusy(false); }
  };
  return (
    <article className="highstyle-item">
      <div className="highstyle-photo">
        <img src={imageSource(product.images?.[0])} alt={product.title} loading="lazy" width="320" height="380" />
        {product.discount > 0 && <span className="highstyle-discount">-{product.discount}%</span>}
      </div>
      <div className="highstyle-info">
        <h3>{product.title}</h3>
        <div className="highstyle-price">
          <strong>{discounted.toFixed(2)} USD</strong>
          {product.discount > 0 && <del>{product.price.toFixed(2)} USD</del>}
        </div>
        {product.description && <details><summary>Product details</summary><p>{product.description}</p></details>}
        <button type="button" disabled={!available || busy} onClick={handleAdd} aria-label={`Add ${product.title} to cart`}>
          {busy ? "Adding…" : available ? "Add to cart" : "Unavailable"}
        </button>
      </div>
      <style jsx>{`
        .highstyle-item{background:var(--bs-body-bg,#fff);color:var(--bs-body-color,#222);border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;min-width:0}
        .highstyle-photo{position:relative;aspect-ratio:4/5;overflow:hidden;background:#f4f4f4}
        .highstyle-photo img{width:100%;height:100%;object-fit:cover}
        .highstyle-discount{position:absolute;top:12px;inset-inline-start:12px;background:#7d2031;color:#fff;border-radius:4px;padding:4px 8px;font-weight:700}
        .highstyle-info{display:flex;flex-direction:column;gap:8px;flex:1;padding:16px}
        .highstyle-info h3{font-size:1rem;font-weight:600;line-height:1.4;margin:0}
        .highstyle-price{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        del{color:#757575;font-size:.85rem}
        summary{cursor:pointer;text-decoration:underline}
        details p{margin:8px 0 0;line-height:1.45}
        button{margin-top:auto;min-height:44px;border:0;border-radius:7px;background:#7d2031;color:#fff;font-weight:650;padding:10px 12px;cursor:pointer}
        button:disabled{background:#777;cursor:not-allowed}
        button:focus-visible{outline:3px solid #c2742f;outline-offset:3px}
        @media(hover:hover){button:not(:disabled):hover{background:#531624}}
      `}</style>
    </article>
  );
}

export default function LiveCatalog({ kind = "physical", title = "Featured products", subtitle, designClass = "" }) {
  const { data, loading, error, refetch } = useQuery(LIVE_CATALOG, { fetchPolicy: "cache-and-network" });
  const [createCart] = useMutation(CREATE_ADD_TO_CART);
  const router = useRouter();
  const products = (kind === "digital" ? data?.digitalProducts?.products : data?.physicalProducts?.products) || [];
  const visible = products.filter(product => product?.status === "Available");
  const add = async product => {
    let customer = null;
    try { customer = JSON.parse(window.localStorage.getItem("customerDetail") || "null"); } catch (_) {}
    if (!customer?.id) {
      toast.info("Sign in to add products to your cart");
      router.push(`/${router.query.lng || "en"}/page/account/login`);
      return;
    }
    try {
      await createCart({ variables: { input: {
        userId: customer.id,
        products: [{
          ProductID: product.id, title: product.title, price: product.price,
          totalAmount: product.price, quantity: 1,
          color: product.colors?.[0] || "", size: product.sizes?.[0] || "",
        }],
      } } });
      toast.success("Added to your cart");
    } catch (error) {
      toast.error(error.message || "Unable to add this product");
    }
  };
  return (
    <section className={designClass} aria-label={title}>
      <div className="container highstyle-section">
        <header><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</header>
        {loading && !data && <p role="status">Loading products…</p>}
        {error && <div role="alert"><p>Products are temporarily unavailable.</p><button type="button" onClick={() => refetch()}>Try again</button></div>}
        {!loading && !error && visible.length === 0 && <p role="status">No products are available yet.</p>}
        {visible.length > 0 && <div className="highstyle-grid">{visible.map(product =>
          <ProductCard key={product.id} product={product} kind={kind} add={add} />
        )}</div>}
      </div>
      <style jsx>{`
        .highstyle-section{padding-top:28px;padding-bottom:44px}
        header{text-align:center;margin-bottom:26px}
        h2{font-size:clamp(1.3rem,2.8vw,2.2rem);font-weight:700;margin:0}
        header p{color:#777;margin:8px 0 0}
        .highstyle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        @media(min-width:720px){.highstyle-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}}
        @media(min-width:1100px){.highstyle-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:22px}}
        button{min-height:44px;padding:8px 16px}
      `}</style>
    </section>
  );
}
