import React, { useEffect, useState } from "react";
import { Media } from "reactstrap";
import { useQuery } from "@apollo/client";
import { GET_CART } from "../../GraphQL/Queries/cartQueries";
import CartHeader from "../headers/common/cart-header";
import LocalLink from "../LocalLink";
import { useTranslation } from "react-i18next";

export default function CartContainer({ icon }) {
  const { t } = useTranslation();
  const [customer, setCustomer] = useState(null);
  useEffect(() => {
    try { setCustomer(JSON.parse(window.localStorage.getItem("customerDetail") || "null")); }
    catch (_) { setCustomer(null); }
  }, []);
  const { data, loading, refetch } = useQuery(GET_CART, {
    variables: { userId: customer?.id || "000000000000000000000000" },
    skip: !customer?.id,
    fetchPolicy: "cache-and-network",
  });
  const cart = data?.getCart;
  const items = cart?.products || [];
  return (
    <li className="onhover-div mobile-cart">
      <div className="cart-qty-cls" aria-label={`${items.length} cart items`}>{items.length}</div>
      <LocalLink href="/page/account/cart">
        <div>
          <Media src={icon} className="img-fluid" alt="Cart" />
          <i className="fa fa-shopping-cart" aria-hidden="true" />
        </div>
      </LocalLink>
      <ul className="show-div shopping-cart">
        {loading && <li role="status">Loading cart…</li>}
        {!customer?.id && <li><LocalLink href="/page/account/login">Sign in to view your cart</LocalLink></li>}
        {customer?.id && !loading && items.length === 0 && <li><h5>{t("cart_details.cart_empty_message")}</h5></li>}
        {items.map(item => <CartHeader key={item._id || item.ProductID} item={item} cartId={cart.id} onChanged={refetch} />)}
        {items.length > 0 && (
          <li>
            <div className="total"><h5>{t("cart_details.subTotal")}:
              <span> {Number(cart.totalAmount || 0).toFixed(2)} USD</span>
            </h5></div>
            <div className="buttons view-cart">
              <LocalLink href="/page/account/cart">{t("cart_details.check_out")}</LocalLink>
            </div>
          </li>
        )}
      </ul>
    </li>
  );
}
