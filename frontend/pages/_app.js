import React, { useEffect, useState } from "react";
import ThemeSettings from "../components/customizer/theme-settings";
import "../public/assets/scss/app.scss";
import { ToastContainer } from "react-toastify";
import TapTop from "../components/common/widgets/Tap-Top";
// import MessengerCustomerChat from "react-messenger-customer-chat";
import CartContextProvider from "../helpers/cart/CartContext";
import { WishlistContextProvider } from "../helpers/wishlist/WishlistContext";
import FilterProvider from "../helpers/filter/FilterProvider";
import SettingProvider from "../helpers/theme-setting/SettingProvider";
import { CompareContextProvider } from "../helpers/Compare/CompareContext";
import { CurrencyContextProvider } from "../helpers/Currency/CurrencyContext";
import Helmet from "react-helmet";
import { ApolloProvider } from "@apollo/client";
import client from "../lib/apolloClient";
import { Elements } from "@stripe/react-stripe-js";
import { LanguageProvider } from "../context/LanguageContext";
import { loadStripe } from "@stripe/stripe-js";
import "../i18n";
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function MyApp({ Component, pageProps }) {
  const [isLoading] = useState(false);
  const [url, setUrl] = useState();

  useEffect(() => {
    const path = window.location.pathname.split("/");
    const url = path[path.length - 1];
    document.body.classList.add("dark");

  }, []);

  return (
    <>
      <ApolloProvider client={client}>
        {isLoading ? (
          <div className="loader-wrapper">
            {url === "Christmas" ? (
              <div id="preloader"></div>
            ) : (
              <div className="loader"></div>
            )}
          </div>
        ) : (
          <>
            {/* <MessengerCustomerChat
            pageId="2123438804574660"
            appId="406252930752412"
            htmlRef="https://connect.facebook.net/en_US/sdk.js"
          /> */}
            <Helmet>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
              {/* <Head>
              <link rel="icon" type="image/x-icon" href={favicon} />
            </Head> */}
              <title>HighStyle | Fashion and lifestyle</title>
            </Helmet>
            <div>
              <LanguageProvider>
                <SettingProvider>
                  <CompareContextProvider>
                    <CurrencyContextProvider>
                      <CartContextProvider>
                        <WishlistContextProvider>
                          <FilterProvider>
                            <Elements stripe={stripePromise}>
                              <Component {...pageProps} />
                            </Elements>
                          </FilterProvider>
                        </WishlistContextProvider>
                      </CartContextProvider>
                    </CurrencyContextProvider>
                    <ThemeSettings />
                  </CompareContextProvider>
                </SettingProvider>
              </LanguageProvider>
              <ToastContainer />
              <TapTop />
            </div>
          </>
        )}
      </ApolloProvider>
    </>
  );
}
