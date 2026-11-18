import React, { useEffect, useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import LocalLink from "../LocalLink";
import { GET_CART } from "../../GraphQL/Queries/cartQueries";
import { LOGOUT_USER } from "../../GraphQL/Mutations/authMutations";
import useCustomer, { CART_CHANGED, CUSTOMER_CHANGED } from "./useCustomer";
import useStoreText from "./useStoreText";
import Icon from "./Icon";

export default function StoreHeader() {
  const { text, locale } = useStoreText();
  const router = useRouter();
  const client = useApolloClient();
  const { customer } = useCustomer();
  const [search, setSearch] = useState("");
  const [logout, { loading: loggingOut }] = useMutation(LOGOUT_USER);
  const { data, refetch } = useQuery(GET_CART, {
    variables: { userId: customer?.id || "000000000000000000000000" },
    skip: !customer?.id,
    fetchPolicy: "cache-and-network",
  });
  useEffect(() => { setSearch(typeof router.query.q === "string" ? router.query.q : ""); }, [router.query.q]);
  useEffect(() => {
    const sync = () => { if (customer?.id) refetch().catch(() => {}); };
    window.addEventListener(CART_CHANGED, sync);
    return () => window.removeEventListener(CART_CHANGED, sync);
  }, [customer?.id, refetch]);
  const count = customer ? (data?.getCart?.products || []).reduce((sum, item) => sum + item.quantity, 0) : 0;
  const changeLanguage = event => {
    const language = event.target.value;
    const path = router.asPath.replace(/^\/(en|ar|sv|es|fr|pt)(?=\/|\?|#|$)/, `/${language}`);
    router.push(path.startsWith(`/${language}`) ? path : `/${language}`);
  };
  const signOut = async () => {
    try {
      await logout();
      localStorage.removeItem("customerDetail");
      sessionStorage.removeItem("highstyle:delivery");
      window.dispatchEvent(new Event(CUSTOMER_CHANGED));
      await client.clearStore();
      router.push(`/${locale}`);
    } catch (_) { router.push(`/${locale}/page/account/login`); }
  };
  return <>
    <a className="hs-skip" href="#main-content">{text("skip")}</a>
    <div className="hs-announcement">{process.env.NEXT_PUBLIC_PAYMENT_MODE === "test" ? text("testStore") : text("tagline")}</div>
    <header className="hs-header">
      <div className="hs-container hs-header-main">
        <LocalLink href="/" className="hs-wordmark" aria-label="HighStyle home">HighStyle<span>®</span></LocalLink>
        <nav className="hs-desktop-nav" aria-label={text("shop")}>
          <LocalLink href="/#collection">{text("shop")}</LocalLink>
          <LocalLink href="/page/account/orders">{text("orders")}</LocalLink>
        </nav>
        <form className="hs-search" role="search" onSubmit={event => {
          event.preventDefault();
          router.push({ pathname: `/${locale}`, query: search.trim() ? { q: search.trim() } : {}, hash: "collection" });
        }}>
          <label className="hs-visually-hidden" htmlFor="store-search">{text("search")}</label>
          <input id="store-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={text("searchPlaceholder")} maxLength={100} />
          <button type="submit" aria-label={text("search")}><Icon name="search" size={20} /></button>
        </form>
        <div className="hs-header-actions">
          <label className="hs-visually-hidden" htmlFor="store-language">{text("language")}</label>
          <select id="store-language" className="hs-language" value={locale} onChange={changeLanguage}>
            <option value="en">EN</option><option value="ar">عربي</option><option value="sv">SV</option><option value="fr">FR</option><option value="es">ES</option><option value="pt">PT</option>
          </select>
          <LocalLink className="hs-icon-button hs-account-link" href={customer ? "/page/account/orders" : "/page/account/login"} aria-label={customer ? text("orders") : text("signIn")}><Icon name="user" /></LocalLink>
          <LocalLink className="hs-icon-button hs-bag-link" href="/page/account/cart" aria-label={`${text("bag")}${count ? ` (${count})` : ""}`}><Icon name="bag" />{count > 0 && <span className="hs-count">{count > 99 ? "99+" : count}</span>}</LocalLink>
        </div>
      </div>
      {customer && <div className="hs-container hs-account-row"><span>{customer.firstname}</span><button type="button" onClick={signOut} disabled={loggingOut}>{text("signOut")}</button></div>}
    </header>
  </>;
}
