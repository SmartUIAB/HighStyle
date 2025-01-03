const createPaymentIntent = (cartTotal, currency) => {
  return window
    .fetch(`http://localhost:4000/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cartTotal, currency })
    })
    .then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then(data => {
      if (!data || data.error) {
        throw new Error("PaymentIntent API Error");
      } else {
        return data.client_secret;
      }
    });
};

const getPublicStripeKey = () => {
  return window
    .fetch(`http://localhost:4000/public-key`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then(data => {
      if (!data || data.error) {
        console.log("API error:", { data });
        throw Error("API Error");
      } else {
        return data.publicKey;
      }
    });
};

const api = {
  createPaymentIntent,
  getPublicStripeKey,
  //getOrderDetails
};

export default api;
