import React from "react";
import LocalLink from "../LocalLink";
import useStoreText from "./useStoreText";
import Icon from "./Icon";

export default function StoreFooter() {
  const { text } = useStoreText();
  return <footer className="hs-footer">
    <div className="hs-container hs-footer-grid">
      <div><LocalLink href="/" className="hs-wordmark">HighStyle<span>®</span></LocalLink><p>{text("footerTagline")}</p></div>
      <nav aria-label={text("shop")}><LocalLink href="/#collection">{text("shop")}</LocalLink><LocalLink href="/page/account/cart">{text("bag")}</LocalLink><LocalLink href="/page/account/orders">{text("orders")}</LocalLink><LocalLink href="/page/account/login">{text("account")}</LocalLink></nav>
      <p className="hs-footer-note">{text("footerNote")}</p>
    </div>
    <div className="hs-container hs-footer-bottom"><span>© {new Date().getFullYear()} HighStyle. {text("rights")}</span><a href="#top">{text("backTop")} <Icon name="arrow" size={18} /></a></div>
  </footer>;
}
