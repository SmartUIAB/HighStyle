import React from "react";
import Head from "next/head";
import Header from "../../components/storefront/StoreHeader";
import Footer from "../../components/storefront/StoreFooter";
import LiveCatalog from "../../components/common/Collections/LiveCatalog";
import LocalLink from "../../components/LocalLink";
import Icon from "../../components/storefront/Icon";
import useStoreText from "../../components/storefront/useStoreText";

export default function Storefront() {
  const { text } = useStoreText();
  return <>
    <Head><title>HighStyle | {text("physical")}</title><meta name="description" content={text("heroBody")} /></Head>
    <Header />
    <main id="main-content" tabIndex={-1}>
      <section className="hs-hero hs-container" aria-labelledby="hero-title">
        <div className="hs-hero-copy"><span className="hs-eyebrow">HIGHSTYLE — {text("tagline")}</span><h1 id="hero-title">{text("heroTitle")}</h1><p>{text("heroBody")}</p><LocalLink href="/#collection" className="hs-button">{text("explore")}<Icon name="arrow" size={20} /></LocalLink><div className="hs-hero-foot"><span>01 /</span><span>{text("physical")}</span></div></div>
        <div className="hs-hero-photo"><img src="/assets/images/home-banner/2.jpg" alt="" width="1920" height="718" fetchPriority="high" /><span className="hs-hero-monogram" aria-hidden="true">H.</span></div>
      </section>
      <div className="hs-container hs-shopping-notes"><div><Icon name="bag" /><span>{text("orderReview")}</span></div><span aria-hidden="true">/</span><div><Icon name="box" /><span>{text("delivery")}</span></div><span aria-hidden="true">/</span><div><Icon name="lock" /><span>{text("payment")}</span></div></div>
      <LiveCatalog showKinds />
      <section className="hs-editorial hs-container"><div><span className="hs-eyebrow">HIGHSTYLE / YOUR WAY</span><h2>{text("cartIntro")}</h2><p>{text("cartBody")}</p></div><LocalLink href="/page/account/cart" className="hs-button hs-button-outline">{text("viewBag")}<Icon name="bag" /></LocalLink></section>
    </main>
    <Footer />
  </>;
}
