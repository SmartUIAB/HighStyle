import React from "react";
import LocalLink from "../../../../../components/LocalLink";
import useStoreText from "../../../../../components/storefront/useStoreText";

// The legacy template payment form is retired; every payment starts with a server-priced checkout.
export default function CheckoutLink() {
  const { text } = useStoreText();
  return <div className="hs-container hs-empty"><LocalLink href="/page/account/cart" className="hs-button">{text("viewBag")}</LocalLink></div>;
}
