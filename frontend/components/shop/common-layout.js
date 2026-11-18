import React from "react";
import Head from "next/head";
import Header from "../storefront/StoreHeader";
import Footer from "../storefront/StoreFooter";

export default function CommonLayout({ children, title }) {
  return <><Head><title>{title ? `${title} | HighStyle` : "HighStyle"}</title></Head><Header /><main id="main-content" tabIndex={-1}>{children}</main><Footer /></>;
}
