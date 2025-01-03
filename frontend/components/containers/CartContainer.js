import React, { useContext, Fragment } from "react";
import Link from "next/link";
import CartHeader from "../headers/common/cart-header";
import CartContext from "../../helpers/cart";
import { Media } from "reactstrap";
import { CurrencyContext } from "../../helpers/Currency/CurrencyContext";
import { useQuery } from "@apollo/client";
import { GET_CART } from "../../GraphQL/Queries/cartQueries";
import { toast } from "react-toastify";
import LocaleLink from "../LocaleLink";

const CartContainer = ({ icon }) => {
  const userData = JSON.parse(localStorage.getItem("customerDetail"));

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
        <LocaleLink href={`/page/account/cart`}>
          <div>
            <Media src={icon} className="img-fluid" alt="" />
            <i className="fa fa-shopping-cart"></i>
          </div>
        </LocaleLink>
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
                    delsumma : <span>{cartList?.getCart?.totalAmount}</span>
                  </h5>
                </div>
              </li>
              <li>
                <div className="buttons view-cart">
                  <LocaleLink href={`/page/account/cart`}>
                    Add to Cart
                  </LocaleLink>
                  <LocaleLink
                    href={`/page/account/checkout`}
                    className="checkout"
                  >
                    CheckOut
                  </LocaleLink>
                </div>
              </li>
            </div>
          ) : (
            <li>
              <h5>Din varukorg är för närvarande tom.</h5>
            </li>
          )}
        </ul>
      </li>
    </Fragment>
  );
};

export default CartContainer;
