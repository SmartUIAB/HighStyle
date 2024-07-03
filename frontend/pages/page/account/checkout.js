import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutPage from "./common/checkout-page";
import Login from "../../page/account/login-auth";
import api from "./common/api";

const Checkout = () => {
  const [currentUser, setCurrentUser] = useState(localStorage.getItem("user"));
  
  useEffect(() => {
    setCurrentUser(localStorage.getItem("user"));
  }, [localStorage.getItem("user")]);
  const stripePromise = api.getPublicStripeKey().then(key => loadStripe(key));

  console.log('Stripe Publishable Key:', stripePromise); // Add this line for debugging

  return (

    <>

      {currentUser !== null ? (
        <Elements stripe={stripePromise}>
          <CheckoutPage />
        </Elements>
      ) : (
        <Login />
      )}
    </>
  );
};

export default Checkout;
