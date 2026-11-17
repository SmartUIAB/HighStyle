import React from "react";
import { Media } from "reactstrap";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { DELETE_CART_ITEM } from "../../../GraphQL/Mutations/cartMutations";
import LocalLink from "../../LocalLink";

export default function CartHeader({ item, cartId, onChanged }) {
  const [deleteCart, { loading }] = useMutation(DELETE_CART_ITEM);
  const remove = async () => {
    if (!cartId || !item?._id) return;
    try {
      await deleteCart({ variables: { cartId, productId: item._id } });
      await onChanged?.();
      toast.success("Item removed from your cart");
    } catch (error) { toast.error(error.message || "Could not remove this item"); }
  };
  const image = item.image?.startsWith("https://") ? item.image
    : item.image ? `${process.env.NEXT_PUBLIC_API_KEY || ""}${item.image}`
    : "/assets/images/icon-empty-cart.png";
  return (
    <li>
      <div className="media">
        <LocalLink href={`/product-details/${item.ProductID}`}>
          <Media alt={item.title} className="me-3" src={image} loading="lazy" />
        </LocalLink>
        <div className="media-body">
          <h6>{item.title}</h6>
          <p>{item.quantity} × {Number(item.price || 0).toFixed(2)} USD</p>
        </div>
      </div>
      <button type="button" className="close-circle" onClick={remove}
        disabled={loading} aria-label={`Remove ${item.title} from cart`}>
        <i className="fa fa-times" aria-hidden="true" />
      </button>
    </li>
  );
}
