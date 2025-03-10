import React, { Fragment, useEffect, useState } from "react";
import CartHeader from "../headers/common/cart-header";
import { Media } from "reactstrap";
import { useQuery } from "@apollo/client";
import { GET_CART } from "../../GraphQL/Queries/cartQueries";
import LocalLink from "../LocalLink";
import { useTranslation } from "react-i18next";
import axios from "axios";

const CartContainer = ({ icon }) => {
  const storedUserData = localStorage.getItem("customerDetail");
  const userData = storedUserData ? JSON.parse(storedUserData) : null;
  const lang = localStorage.getItem("i18nextLng");

  const [rates, setRates] = useState({});

  const fetchRates = async () => {
    try {
      const response = await axios.get(
        "https://v6.exchangerate-api.com/v6/8c6fe5d5c563341bd11be392/latest/USD"
      );
      setRates(response.data);
    } catch (err) {
      setError("Failed to fetch exchange rates");
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const { t } = useTranslation();

  const {
    data: cartList,
    loading,
    refetch,
  } = useQuery(GET_CART, {
    variables: userData?.id ? { userId: userData.id } : undefined,
    skip: !userData?.id,
  });

  useEffect(() => {
    if (cartList) refetch();
  }, [cartList, refetch]);

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
                    <span>
                      {(
                        cartList?.getCart?.totalAmount.toFixed(2) *
                        ((lang === "en" && rates?.conversion_rates?.USD) ||
                          (lang === "es" && rates?.conversion_rates?.EUR) ||
                          (lang === "pt" && rates?.conversion_rates?.EUR) ||
                          (lang === "fr" && rates?.conversion_rates?.EUR) ||
                          (lang === "ar" && rates?.conversion_rates?.SRD) ||
                          (lang === "sv" && rates?.conversion_rates?.SEK) ||
                          1)
                      ).toFixed(2)}
                    </span>
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
