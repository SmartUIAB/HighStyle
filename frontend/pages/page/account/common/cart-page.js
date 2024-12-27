"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container, Row, Col, Media } from "reactstrap";
import cart from "../../../../public/assets/images/icon-empty-cart.png";
import { useMutation, useQuery } from "@apollo/client";
import { GET_CART } from "../../../../GraphQL/Queries/cartQueries";
import {
  DELETE_CART_ITEM,
  UPDATE_CART_ITEM,
} from "../../../../GraphQL/Mutations/cartMutations";
import { toast } from "react-toastify";
import { CREATE_ORDER } from "../../../../GraphQL/Mutations/orderMutations";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Load Stripe using your public key
const stripePromise = loadStripe(
  "sk_test_51NzFdCSCDT42kkid2TDRj7EniJjJYo4RwYHKecRzS7G7v2oSckRk5u0eFULCk8MlDguedWSiYZ10tVK9kyDbMbA700FfjhSWZZ"
);

const CartPage = () => {
  const userData = JSON.parse(localStorage.getItem("customerDetail"));
  const [cartId, setCartId] = useState(null);
  const [deleteCart] = useMutation(DELETE_CART_ITEM);
  const [updateCart] = useMutation(UPDATE_CART_ITEM);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] =
    useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  if (!stripePromise) {
    return <div>Loading...</div>;
  }

  const {
    data: cartItems,
    loading,
    refetch,
  } = useQuery(GET_CART, {
    variables: { userId: userData?.id },
  });

  useEffect(() => {
    if (cartItems && cartItems.getCart) {
      setCartId(cartItems.getCart.id);
    }
  }, [cartItems]);

  const handleQtyUpdate = async (item, quantity) => {
    const { data } = await updateCart({
      variables: {
        cartId: cartItems.getCart.id,
        productId: item._id,
        newQuantity: parseInt(quantity),
      },
    });
    if (data) {
      refetch();
    } else {
      toast.error("Failed to update cart");
    }
  };

  const removeFromCart = async (item) => {
    const { data } = await deleteCart({
      variables: {
        cartId: cartItems.getCart.id,
        productId: item._id,
      },
    });
    if (data) {
      refetch();
    } else {
      toast.error("Failed to remove item from cart");
    }
  };

  const handleCheckout = async () => {
    try {
      const { data } = await createOrder({
        variables: {
          customerId: userData?.id,
          cartId: cartItems.getCart.id,
        },
      });

      if (data) {
        window.location.href = data.AddOrder.paymentIntentClientSecret;
      } else {
        toast.error("Failed to create order");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Error: " + error.message);
      setIsProcessing(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Ensure Elements wraps the payment section */}
      {cartItems?.getCart?.products?.length > 0 ? (
        <section className="cart-section section-b-space">
          <Container>
            <Row>
              <Col sm="12">
                <table className="table cart-table table-responsive-xs">
                  <thead>
                    <tr className="table-head">
                      <th scope="col">image</th>
                      <th scope="col">product name</th>
                      <th scope="col">price</th>
                      <th scope="col">quantity</th>
                      <th scope="col">action</th>
                      <th scope="col">total</th>
                    </tr>
                  </thead>
                  {cartItems?.getCart.products?.map((item, index) => (
                    <tbody key={index}>
                      <tr>
                        <td>
                          <Link href={`/product-details/` + item.ProductID}>
                            <Media
                              src={
                                item.images
                                  ? process.env.NEXT_PUBLIC_API_KEY + item.image
                                  : process.env.NEXT_PUBLIC_API_KEY + item.image
                              }
                              alt=""
                            />
                          </Link>
                        </td>
                        <td>
                          <Link href={`/product-details/` + item.ProductID}>
                            {item.title}
                          </Link>
                        </td>
                        <td>
                          <h2>{item.price}</h2>
                        </td>
                        <td>
                          <div className="qty-box">
                            <div className="input-group">
                              <input
                                type="number"
                                name="quantity"
                                onChange={(e) =>
                                  handleQtyUpdate(item, e.target.value)
                                }
                                className="form-control input-number"
                                value={item.quantity}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <i
                            className="fa fa-times"
                            onClick={() => removeFromCart(item)}
                          ></i>
                        </td>
                        <td>
                          <h2 className="td-color">{item.totalAmount}</h2>
                        </td>
                      </tr>
                    </tbody>
                  ))}
                </table>
                <table className="table cart-table table-responsive-md">
                  <tfoot>
                    <tr>
                      <td>total price :</td>
                      <td>
                        <h2>{cartItems?.getCart?.totalAmount}</h2>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </Col>
            </Row>
            <Row className="cart-buttons">
              <Col xs="6">
                <Link href={`/shop/left_sidebar`} className="btn btn-solid">
                  continue shopping
                </Link>
              </Col>
              <Col xs="6">
                <button onClick={handleCheckout} className="btn btn-solid">
                  check out
                </button>
              </Col>
            </Row>
          </Container>
        </section>
      ) : (
        <section className="cart-section section-b-space">
          <Container>
            <Row>
              <Col sm="12">
                <div>
                  <div className="col-sm-12 empty-cart-cls text-center">
                    <Media
                      src={cart}
                      className="img-fluid mb-4 mx-auto"
                      alt=""
                    />
                    <h3>
                      <strong>Your Cart is Empty</strong>
                    </h3>
                    <h4>Explore more and shortlist some items.</h4>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </div>
  );
};

export default CartPage;
