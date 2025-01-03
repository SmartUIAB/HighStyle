import React, { Fragment, useContext } from "react";
import Link from "next/link";
import { Media } from "reactstrap";
import { DELETE_CART_ITEM } from "../../../GraphQL/Mutations/cartMutations";
import { useMutation } from "@apollo/client";
import LocaleLink from "../../LocaleLink";

const CartHeader = ({ item, symbol }) => {
    const [deleteCart] = useMutation(DELETE_CART_ITEM);

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
          <LocaleLink href={"/product-details/" + item.ProductID}>
            <Media
              alt=""
              className="me-3"
              src={process.env.NEXT_PUBLIC_API_KEY + `${item.image}`}
            />
          </LocaleLink>
          <div className="media-body">
            <LocaleLink href={"/product-details/" + item.id}>
              <h6>{item.title}</h6>
            </LocaleLink>

            <h4>
              <span>
                {item.qty} x
                {(item.price).toFixed(2)}
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
