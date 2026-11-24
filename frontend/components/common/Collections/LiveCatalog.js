import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import ProductCard from "../../storefront/ProductCard";
import useAddToCart from "../../storefront/useAddToCart";
import useStoreText from "../../storefront/useStoreText";
import Icon from "../../storefront/Icon";

const PHYSICAL_CATALOG = gql`
  query StorePhysicalCatalog($page: Int!, $search: String, $sort: CatalogSort, $inStock: Boolean) {
    physicalProducts(pagination: { page: $page, limit: 12 }, search: $search, sort: $sort, inStock: $inStock) {
      products { id title description price discount availableQuantity status images colors sizes category { id name } }
      currentPage totalPages total
    }
  }
`;
const DIGITAL_CATALOG = gql`
  query StoreDigitalCatalog($page: Int!, $search: String, $sort: CatalogSort, $inStock: Boolean) {
    digitalProducts(pagination: { page: $page, limit: 12 }, search: $search, sort: $sort, inStock: $inStock) {
      products { id title description price discount status images category { id name } }
      currentPage totalPages total
    }
  }
`;

export default function LiveCatalog({ kind = "physical", title, showKinds = false }) {
  const [selectedKind, setSelectedKind] = useState(kind);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("featured");
  const [inStock, setInStock] = useState(false);
  const { text, locale } = useStoreText();
  const router = useRouter();
  const search = typeof router.query.q === "string" ? router.query.q.trim() : "";
  const { data, loading, error, refetch } = useQuery(selectedKind === "digital" ? DIGITAL_CATALOG : PHYSICAL_CATALOG, { variables: { page, search, sort, inStock }, fetchPolicy: "cache-and-network", notifyOnNetworkStatusChange: true });
  const { add, busyId, error: addError } = useAddToCart();
  const result = selectedKind === "digital" ? data?.digitalProducts : data?.physicalProducts;
  const products = result?.products || [];
  useEffect(() => { setPage(1); }, [selectedKind, search, sort, inStock]);
  const visible = products.filter(product => product.status === "Available");
  const changePage = next => { setPage(next); document.getElementById("collection")?.scrollIntoView({ block: "start" }); };
  return <section id="collection" className="hs-catalog hs-container" aria-labelledby="collection-heading" aria-busy={loading}>
    <div className="hs-section-title"><div><span className="hs-eyebrow">HIGHSTYLE / {selectedKind === "digital" ? "DIGITAL" : "COLLECTION"}</span><h2 id="collection-heading">{title || text("collection")}</h2><p>{text("collectionBody")}</p></div><span className="hs-collection-mark" aria-hidden="true">H.</span></div>
    <div className="hs-catalog-toolbar">
      {showKinds && <div className="hs-pills" role="group" aria-label={text("shop")}><button type="button" aria-pressed={selectedKind === "physical"} onClick={() => setSelectedKind("physical")}>{text("physical")}</button><button type="button" aria-pressed={selectedKind === "digital"} onClick={() => setSelectedKind("digital")}>{text("digital")}</button></div>}
      <div className="hs-catalog-filters"><label className="hs-checkbox"><input type="checkbox" checked={inStock} onChange={event => setInStock(event.target.checked)} />{text("available")}</label><label className="hs-sort"><span className="hs-visually-hidden">{text("sort")}</span><select value={sort} onChange={event => setSort(event.target.value)}>{["featured", "priceLow", "priceHigh", "name"].map(value => <option key={value} value={value}>{text(value)}</option>)}</select></label></div>
    </div>
    {search && <div className="hs-search-summary"><span><Icon name="search" size={18} /> “{search}” · {visible.length} {text("results")}</span><button type="button" className="hs-text-button" onClick={() => router.push(`/${locale}#collection`)}>{text("clear")}<Icon name="close" size={16} /></button></div>}
    {addError && <p className="hs-notice hs-notice-error" role="alert">{addError}</p>}
    {error && <div className="hs-empty" role="alert"><Icon name="info" size={32} /><p>{text("loadError")}</p><button type="button" className="hs-button hs-button-outline" onClick={() => refetch()}>{text("retry")}</button></div>}
    {loading && !data && <div className="hs-product-grid" role="status" aria-label={text("loadingProducts")}>{Array.from({ length: 4 }, (_, index) => <div className="hs-skeleton-card" key={index}><div /><span /><span /></div>)}</div>}
    {!loading && !error && visible.length === 0 && <div className="hs-empty"><Icon name="search" size={36} /><h3>{search || inStock ? text("noResults") : text("emptyCatalog")}</h3>{(search || inStock) && <button type="button" className="hs-button hs-button-outline" onClick={() => { setInStock(false); router.push(`/${locale}#collection`); }}>{text("clear")}</button>}</div>}
    {!error && visible.length > 0 && <div className="hs-product-grid">{visible.map(product => <ProductCard key={product.id} product={product} kind={selectedKind} add={add} busyId={busyId} />)}</div>}
    {!error && result?.totalPages > 1 && <nav className="hs-pagination" aria-label={text("page")}><button type="button" className="hs-button hs-button-outline" disabled={loading || page <= 1} onClick={() => changePage(page - 1)}>{text("previous")}</button><span>{text("page")} {page} {text("of")} {result.totalPages}</span><button type="button" className="hs-button hs-button-outline" disabled={loading || page >= result.totalPages} onClick={() => changePage(page + 1)}>{text("next")}</button></nav>}
  </section>;
}
