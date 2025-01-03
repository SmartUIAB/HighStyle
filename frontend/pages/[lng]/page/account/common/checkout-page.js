import React, { useEffect, useState, useContext } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js"; 
import api from "./api";
import CartContext from "../../../../helpers/cart";
import { CurrencyContext } from "../../../../helpers/Currency/CurrencyContext";
import { Container, Form, Row, Col } from "reactstrap";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const curContext = useContext(CurrencyContext);
  const cartContext = useContext(CartContext);
  const cartItems = cartContext.state;
  const cartTotal = cartContext.cartTotal;
  const currency = "sek";
  const symbol = curContext.state.symbol;
  const [obj, setObj] = useState({});
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();

  useEffect(() => {
    if (cartTotal && currency) {
      api.createPaymentIntent(cartTotal, currency)
        .then((clientSecret) => {
          setClientSecret(clientSecret);
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [cartTotal, currency]);

  const onSubmit = async (data) => {
    setProcessing(true);
  
    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: data.name,
        },
      },
    });
  
    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
      console.log("[error]", payload.error);
    } else {
      setError(null);
      setSucceeded(true);
      setProcessing(false);
      setMetadata(payload.paymentIntent);
      console.log("[PaymentIntent]", payload.paymentIntent);
  
      router.push({
        pathname: "/page/order-success",
        state: { items: cartItems, orderTotal: cartTotal, symbol: symbol },
      });
    }
  };
  
  const setStateFromInput = (event) => {
    obj[event.target.name] = event.target.value;
    setObj({ ...obj });
  };

  const renderSuccess = () => {
    return (
      <div className="sr-field-success message">
        <h1>Your payment succeeded</h1>
        <p>View PaymentIntent response:</p>
        <pre className="sr-callout">
          <code>{JSON.stringify(metadata, null, 2)}</code>
        </pre>
      </div>
    );
  };

  const renderForm = () => {
    const options = {
      style: {
        base: {
          color: "#32325d",
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#fa755a",
          iconColor: "#fa755a",
        },
      },
    };

    return (
      <Container>
        <div className="checkout-page">
          <div className="checkout-form">
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Col lg="6" sm="12" xs="12">
                  <div className="checkout-title">
                    <h3>Billing Details</h3>
                  </div>
                  <div className="row check-out">
                    <div className="form-group col-md-6 col-sm-6 col-xs-12">
                      <div className="field-label">First Name</div>
                      <input
                        type="text"
                        className={`form-control ${errors.first_name ? "error_border" : ""}`}
                        name="first_name"
                        {...register("first_name", { required: true })}
                      />
                      <span className="error-message">
                        {errors.first_name && "First name is required"}
                      </span>
                    </div>
                    <div className="form-group col-md-6 col-sm-6 col-xs-12">
                      <div className="field-label">Last Name</div>
                      <input
                        type="text"
                        className={`form-control ${errors.last_name ? "error_border" : ""}`}
                        name="last_name"
                        {...register("last_name", { required: true })}
                      />
                      <span className="error-message">
                        {errors.last_name && "Last name is required"}
                      </span>
                    </div>
                    <div className="form-group col-md-6 col-sm-6 col-xs-12">
                      <div className="field-label">Phone</div>
                      <input
                        type="text"
                        name="phone"
                        className={`form-control ${errors.phone ? "error_border" : ""}`}
                        {...register("phone", { pattern: /\d+/ })}
                      />
                      <span className="error-message">
                        {errors.phone && "Please enter a valid phone number"}
                      </span>
                    </div>
                    <div className="form-group col-md-6 col-sm-6 col-xs-12">
                      <div className="field-label">Email Address</div>
                      <input
                        className={`form-control ${errors.email ? "error_border" : ""}`}
                        type="text"
                        name="email"
                        {...register("email", {
                          required: true,
                          pattern: /^\S+@\S+$/i,
                        })}
                      />
                      <span className="error-message">
                        {errors.email && "Please enter a valid email address"}
                      </span>
                    </div>
                    <div className="form-group col-md-12 col-sm-12 col-xs-12">
                      <div className="field-label">Country</div>
                      <select
                        name="country"
                        className={`form-control ${errors.country ? "error_border" : ""}`}
                        {...register("country", { required: true })}
                      >
                        <option value="">Select Country</option>
                        <option>India</option>
                        <option>South Africa</option>
                        <option>United States</option>
                        <option>Australia</option>
                      </select>
                      <span className="error-message">
                        {errors.country && "Please select a country"}
                      </span>
                    </div>
                    <div className="form-group col-md-12 col-sm-12 col-xs-12">
                      <div className="field-label">Address</div>
                      <input
                        className={`form-control ${errors.address ? "error_border" : ""}`}
                        type="text"
                        name="address"
                        {...register("address", { required: true, minLength: 20, maxLength: 120 })}
                        placeholder="Street address"
                      />
                      <span className="error-message">
                        {errors.address && "Please enter a valid address"}
                      </span>
                    </div>
                    <div className="form-group col-md-12 col-sm-12 col-xs-12">
                      <div className="field-label">Town/City</div>
                      <input
                        type="text"
                        className={`form-control ${errors.city ? "error_border" : ""}`}
                        name="city"
                        {...register("city", { required: true })}
                        onChange={setStateFromInput}
                      />
                      <span className="error-message">
                        {errors.city && "Please enter a city"}
                      </span>
                    </div>
                    <div className="form-group col-md-12 col-sm-6 col-xs-12">
                      <div className="field-label">State / County</div>
                      <input
                        type="text"
                        className={`form-control ${errors.state ? "error_border" : ""}`}
                        name="state"
                        {...register("state", { required: true })}
                        onChange={setStateFromInput}
                      />
                      <span className="error-message">
                        {errors.state && "Please enter a state"}
                      </span>
                    </div>
                    <div className="form-group col-md-12 col-sm-6 col-xs-12">
                      <div className="field-label">Postal Code</div>
                      <input
                        type="text"
                        name="pincode"
                        className={`form-control ${errors.pincode ? "error_border" : ""}`}
                        {...register("pincode", { pattern: /\d+/ })}
                      />
                      <span className="error-message">
                        {errors.pincode && "Please enter a valid postal code"}
                      </span>
                    </div>
                    <div className="form-group col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <input
                        type="checkbox"
                        name="create_account"
                        id="account-option"
                      />
                      &ensp;{" "}
                      <label htmlFor="account-option">Create An Account?</label>
                    </div>
                  </div>
                </Col>
                <Col lg="6" sm="12" xs="12">
                  {cartItems && cartItems.length > 0 ? (
                    <div className="checkout-details">
                      <div className="order-box">
                        <div className="title-box">
                          <div>
                            Product <span>Total</span>
                          </div>
                        </div>
                        <ul className="qty">
                          {cartItems.map((item, index) => (
                            <li key={index}>
                              {item.title} × {item.qty}{" "}
                              <span>
                                {symbol}
                                {item.total}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <ul className="sub-total">
                          <li>
                            Subtotal{" "}
                            <span className="count">
                              {symbol}
                              {cartTotal}
                            </span>
                          </li>
                          <li>
                            Shipping
                            <div className="shipping">
                              <div className="shopping-option">
                                <input
                                  type="checkbox"
                                  name="free-shipping"
                                  id="free-shipping"
                                />
                                <label htmlFor="free-shipping">
                                  Free Shipping
                                </label>
                              </div>
                              <div className="shopping-option">
                                <input
                                  type="checkbox"
                                  name="local-pickup"
                                  id="local-pickup"
                                />
                                <label htmlFor="local-pickup">
                                  Local Pickup
                                </label>
                              </div>
                            </div>
                          </li>
                        </ul>
                        <ul className="total">
                          <li>
                            Total{" "}
                            <span className="count">
                              {symbol}
                              {cartTotal}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="payment-box">
                        <h1>
                          {cartTotal}
                          {currency}
                        </h1>
                        <div className="sr-combo-inputs">
                          <div className="sr-combo-inputs-row">
                            <input
                              type="text"
                              id="name"
                              name="name"
                              placeholder="Name"
                              autoComplete="cardholder"
                              className="form-control sr-input"
                              {...register("name", { required: true })}
                            />
                          </div>

                          <div className="sr-combo-inputs-row">
                            <CardElement
                              className="sr-input sr-card-element"
                              options={options}
                            />
                          </div>
                        </div>

                        {error && (
                          <div className="message sr-field-error">{error}</div>
                        )}

                        <button
                          className="btn btn-primary"
                          disabled={processing || !clientSecret || !stripe}
                        >
                          {processing ? "Processing…" : "Pay"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-cart-message">
                      <h4>Your cart is empty</h4>
                      <p>Please add items to your cart before proceeding to checkout.</p>
                    </div>
                  )}
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </Container>
    );
  };

  return (
    <div className="checkout-form">
      <div className="sr-payment-form">
        <div className="sr-form-row" />
        {succeeded ? renderSuccess() : renderForm()}
      </div>
    </div>
  );
};

export default CheckoutPage;
