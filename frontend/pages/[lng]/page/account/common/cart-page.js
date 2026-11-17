"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Container,
  Row,
  Col,
  Media,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Form,
  Label,
  Input,
  ModalFooter,
  Button,
} from "reactstrap";
import cart from "../../../../../public/assets/images/icon-empty-cart.png";
import { useMutation, useQuery } from "@apollo/client";
import { GET_CART } from "../../../../../GraphQL/Queries/cartQueries";
import {
  DELETE_CART_ITEM,
  UPDATE_CART_ITEM,
} from "../../../../../GraphQL/Mutations/cartMutations";
import { toast } from "react-toastify";
import { CREATE_ORDER } from "../../../../../GraphQL/Mutations/orderMutations";
import LocalLink from "../../../../../components/LocalLink";
import { useTranslation } from "react-i18next";

const CartPage = () => {
  const [userData, setUserData] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setUserData(JSON.parse(window.localStorage.getItem("customerDetail") || "null")); }
    catch (_) { setUserData(null); }
    setReady(true);
  }, []);
  const [cartId, setCartId] = useState(null);
  const [deleteCart] = useMutation(DELETE_CART_ITEM);
  const [updateCart] = useMutation(UPDATE_CART_ITEM);
  const [createOrder] = useMutation(CREATE_ORDER);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { t } = useTranslation();

  const {
    data: cartItems,
    loading,
    refetch,
  } = useQuery(GET_CART, {
    variables: { userId: userData?.id || "000000000000000000000000" },
    skip: !userData?.id,
    fetchPolicy: "network-only",
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
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      toast.warning(
        "Please add your shipping address before proceeding to checkout."
      );
      return;
    }

    try {
      const { data } = await createOrder({
        variables: {
          customerId: userData?.id,
          cartId: cartItems.getCart.id,
          shippingAddress: shippingAddress,
          locale: localStorage.getItem("i18nextLng"),
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
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Shipping address submitted!");
    setIsModalOpen(false);
  };

  if (!ready || loading) return <div role="status">Loading your cart…</div>;
  if (!userData?.id) return <div className="container py-5"><p>Please sign in to view your cart.</p><LocalLink href="/page/account/login">Sign in</LocalLink></div>;

  return (
    <div>
      {cartItems?.getCart?.products?.length > 0 && (
        <button onClick={() => setIsModalOpen(true)} style={{ float: "right" }}>
          {t("shipping_address.btn_title")}
        </button>
      )}
      {cartItems?.getCart?.products?.length > 0 ? (
        <section className="cart-section section-b-space">
          <Container>
            <Row>
              <Col sm="12">
                <table className="table cart-table table-responsive-xs">
                  <thead>
                    <tr className="table-head">
                      <th scope="col">{t("cart_details.image")}</th>
                      <th scope="col">{t("cart_details.product_name")}</th>
                      <th scope="col">{t("cart_details.price")}</th>
                      <th scope="col">{t("cart_details.quantity")}</th>
                      <th scope="col">{t("cart_details.action")}</th>
                      <th scope="col">{t("cart_details.total")}</th>
                    </tr>
                  </thead>
                  {cartItems?.getCart.products?.map((item, index) => (
                    <tbody key={index}>
                      <tr>
                        <td>
                          <LocalLink
                            href={`/product-details/` + item.ProductID}
                          >
                            <Media
                              src={item.image ? (item.image.startsWith("https://") ? item.image : (process.env.NEXT_PUBLIC_API_KEY || "") + item.image) : "/assets/images/icon-empty-cart.png"}
                              alt={item.title}
                            />
                          </LocalLink>
                        </td>
                        <td>
                          <LocalLink
                            href={`/product-details/` + item.ProductID}
                          >
                            {item.title}
                          </LocalLink>
                        </td>
                        <td>
                          <h2>
                            $
                            {Number(item?.price || 0).toFixed(2)}
                          </h2>
                        </td>
                        <td>
                          <div className="qty-box">
                            <div className="input-group">
                              <input
                                type="number"
                                min="0" max="99" step="1"
                                aria-label={`Quantity of ${item.title}`}
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
                          <button type="button" className="btn btn-outline-danger" aria-label={`Remove ${item.title} from cart`} onClick={() => removeFromCart(item)}><i className="fa fa-times" aria-hidden="true" /></button>
                        </td>
                        <td>
                          <h2 className="td-color">
                            $
                            {Number(item?.totalAmount || 0).toFixed(2)}
                          </h2>
                        </td>
                      </tr>
                    </tbody>
                  ))}
                </table>
                <table className="table cart-table table-responsive-md">
                  <tfoot>
                    <tr>
                      <td>{t("cart_details.total_price")} :</td>
                      <td>
                        {/* <h2>${cartItems?.getCart?.totalAmount.toFixed(2)}</h2> */}
                        <h2>
                          $
                          {Number(cartItems?.getCart?.totalAmount || 0).toFixed(2)}
                        </h2>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </Col>
            </Row>
            <Row className="cart-buttons">
              <Col xs="6">
                <LocalLink href={`/`} className="btn btn-solid">
                  {t("cart_details.continue_shopping")}
                </LocalLink>
              </Col>
              <Col xs="6">
                <button onClick={handleCheckout} className="btn btn-solid">
                  {t("cart_details.check_out")}
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
                      <strong>{t("cart_details.cart_empty")}</strong>
                    </h3>
                    <h4>{t("cart_details.explore_more")}</h4>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)}>
          <ModalHeader toggle={() => setIsModalOpen(false)}>
            {t("shipping_address.modal_title")}
          </ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label for="street">{t("shipping_address.street")}</Label>
                <Input
                  type="text"
                  name="street"
                  id="street"
                  value={shippingAddress.street}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="city">{t("shipping_address.city")}</Label>
                <Input
                  type="text"
                  name="city"
                  id="city"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="state">{t("shipping_address.state")}</Label>
                <Input
                  type="text"
                  name="state"
                  id="state"
                  value={shippingAddress.state}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="postalCode">
                  {t("shipping_address.postal_code")}
                </Label>
                <Input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="country">{t("shipping_address.country")}</Label>
                <Input
                  type="text"
                  name="country"
                  id="country"
                  value={shippingAddress.country}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <ModalFooter>
                <Button color="primary" type="submit">
                  {t("shipping_address.submit")}
                </Button>{" "}
                <Button color="secondary" onClick={() => setIsModalOpen(false)}>
                  {t("shipping_address.cancel")}
                </Button>
              </ModalFooter>
            </Form>
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};

export default CartPage;
