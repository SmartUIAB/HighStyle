import React, { Fragment, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Media } from "reactstrap";
import { DELETE_CART_ITEM } from "../../../GraphQL/Mutations/cartMutations";
import { useMutation } from "@apollo/client";
import LocalLink from "../../LocalLink";
import axios from "axios";

const CartHeader = ({ item, symbol }) => {
  const [deleteCart] = useMutation(DELETE_CART_ITEM);
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
  return (
    <Fragment>
      <li>
        <div className="media">
          <LocalLink href={"/product-details/" + item.ProductID}>
            <Media
              alt=""
              className="me-3"
              src={process.env.NEXT_PUBLIC_API_KEY + `${item.image}`}
            />
          </LocalLink>
          <div className="media-body">
            <LocalLink href={"/product-details/" + item.id}>
              <h6>{item.title}</h6>
            </LocalLink>

            <h4>
              <span>
                {item.qty} x
                {(
                  item?.price.toFixed(2) *
                  ((lang === "en" && rates?.conversion_rates?.USD) ||
                    (lang === "es" && rates?.conversion_rates?.EUR) ||
                    (lang === "pt" && rates?.conversion_rates?.EUR) ||
                    (lang === "fr" && rates?.conversion_rates?.EUR) ||
                    (lang === "ar" && rates?.conversion_rates?.SRD) ||
                    (lang === "sv" && rates?.conversion_rates?.SEK) ||
                    1)
                ).toFixed(2)}
              </span>
            </h4>
          </div>
        </div>
        <div className="close-circle">
          <i
            className="fa fa-times"
            aria-hidden="true"
            onClick={() => removeFromCart(item)}
          ></i>
        </div>
      </li>
    </Fragment>
  );
};

export default CartHeader;
