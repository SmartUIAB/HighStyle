import { useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { CREATE_ADD_TO_CART } from "../../GraphQL/Mutations/cartMutations";
import { availableUnits } from "./commerce.mjs";
import { refreshCart } from "./useCustomer";
import useStoreText from "./useStoreText";

export default function useAddToCart() {
  const [createCart] = useMutation(CREATE_ADD_TO_CART);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const router = useRouter();
  const { text, locale } = useStoreText();
  const add = async (product, { quantity = 1, color = "", size = "", checkout = false, kind = "physical" } = {}) => {
    if (pending.current) return false;
    setError("");
    let customer;
    try { customer = JSON.parse(window.localStorage.getItem("customerDetail") || "null"); } catch (_) {}
    if (!customer?.id) {
      toast.info(text("signInToAdd"));
      router.push({ pathname: `/${locale}/page/account/login`, query: { returnTo: `/${locale}/product-details/${product.id}` } });
      return false;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > availableUnits(product, kind)) { setError(text("unavailable")); return false; }
    if ((product.colors?.length && !product.colors.includes(color)) || (product.sizes?.length && !product.sizes.includes(size))) { setError(text("selectOptions")); return false; }
    pending.current = true;
    setBusyId(product.id);
    try {
      await createCart({ variables: { input: { userId: customer.id, products: [{ ProductID: product.id, title: product.title, price: product.price, totalAmount: product.price * quantity, quantity, color, size }] } } });
      refreshCart();
      toast.success(text("added"));
      if (checkout) router.push(`/${locale}/page/account/cart`);
      return true;
    } catch (_) {
      setError(text("addError"));
      return false;
    } finally {
      pending.current = false;
      setBusyId(null);
    }
  };
  return { add, busyId, error };
}
