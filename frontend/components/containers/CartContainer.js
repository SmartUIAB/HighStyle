import React, { Fragment } from "react";
import CartHeader from "../headers/common/cart-header";
import { Media } from "reactstrap";
import { useQuery } from "@apollo/client";
import { GET_CART } from "../../GraphQL/Queries/cartQueries";
import LocalLink from "../LocalLink";
import { useTranslation } from "react-i18next";

const CartContainer = ({ icon }) => {
  const userData = JSON.parse(localStorage.getItem("customerDetail"));
  const { t } = useTranslation();

  const {
    data: cartList,
    loading,
    refetch,
  } = useQuery(GET_CART, {
    variables: { userId: userData?.id },
  });

  if (cartList) {
    refetch();
  }

  return (
    <Fragment>
      <li className="onhover-div mobile-cart">
        <div className="cart-qty-cls">
          {cartList?.getCart?.products?.length || 0}
        </div>
        <LocalLink href={`/page/account/cart`}>
          <div>
            <Media src={icon} className="img-fluid" alt="" />
            <i className="fa fa-shopping-cart"></i>
          </div>
        </LocalLink>
        <ul className="show-div shopping-cart">
          {cartList?.getCart?.products?.map((item, index) => (
            <CartHeader
              key={index}
              item={item}
              total={cartList?.getCart?.totalAmount}
            />
          ))}
          {cartList?.getCart?.products?.length > 0 ? (
            <div>
              <li>
                <div className="total">
                  <h5>
                    {t("cart_details.subTotal")} :{" "}
                    <span>{cartList?.getCart?.totalAmount}</span>
                  </h5>
                </div>
              </li>
              <li>
                <div className="buttons view-cart">
                  <LocalLink href={`/page/account/cart`}>
                    {t("product_details.addToCart")}
                  </LocalLink>
                  <LocalLink
                    href={`/page/account/checkout`}
                    className="checkout"
                  >
                    {t("cart_details.check_out")}
                  </LocalLink>
                </div>
              </li>
            </div>
          ) : (
            <li>
              <h5>{t("cart_details.cart_empty_message")}</h5>
            </li>
          )}
        </ul>
      </li>
    </Fragment>
  );
};

export default CartContainer;
