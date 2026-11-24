import React from "react";
import CommonLayout from "../../../components/shop/common-layout";
import ProductPage from "../../../components/storefront/ProductPage";
import useStoreText from "../../../components/storefront/useStoreText";

export default function ProductDetails() {
  const { text } = useStoreText();
  return <CommonLayout title={text("description")}><ProductPage /></CommonLayout>;
}
