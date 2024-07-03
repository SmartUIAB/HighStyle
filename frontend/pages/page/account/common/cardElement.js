import React from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const StripeCardElement = ({ cartTotal, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.error(error);
    } else {
      // Handle the payment method and submit to your server
      const paymentResult = await stripe.confirmCardPayment("client-secret-from-server", {
        payment_method: paymentMethod.id,
      });

      if (paymentResult.error) {
        console.error(paymentResult.error.message);
      } else if (paymentResult.paymentIntent.status === "succeeded") {
        onPaymentSuccess(paymentResult.paymentIntent);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay {cartTotal}
      </button>
    </form>
  );
};

export default StripeCardElement;
