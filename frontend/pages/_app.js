import React from "react";
import Head from "next/head";
import "../public/assets/scss/app.scss";
import "react-toastify/dist/ReactToastify.css";
import "../styles/storefront.css";
import { ToastContainer } from "react-toastify";
import CartContextProvider from "../helpers/cart/CartContext";
import { WishlistContextProvider } from "../helpers/wishlist/WishlistContext";
import FilterProvider from "../helpers/filter/FilterProvider";
import SettingProvider from "../helpers/theme-setting/SettingProvider";
import { CompareContextProvider } from "../helpers/Compare/CompareContext";
import { CurrencyContextProvider } from "../helpers/Currency/CurrencyContext";
import { ApolloProvider } from "@apollo/client";
import client from "../lib/apolloClient";
import { LanguageProvider } from "../context/LanguageContext";
import "../i18n";

export default function MyApp({ Component, pageProps }) {
  return <ApolloProvider client={client}>
    <Head><meta name="viewport" content="width=device-width, initial-scale=1" /><title>HighStyle | Fashion & lifestyle</title><link rel="icon" href="/assets/images/favicon/1.png" /></Head>
    <LanguageProvider><SettingProvider><CompareContextProvider><CurrencyContextProvider><CartContextProvider><WishlistContextProvider><FilterProvider>
      <div id="top" className="hs-site"><Component {...pageProps} /></div>
      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar closeOnClick theme="light" />
    </FilterProvider></WishlistContextProvider></CartContextProvider></CurrencyContextProvider></CompareContextProvider></SettingProvider></LanguageProvider>
  </ApolloProvider>;
}
