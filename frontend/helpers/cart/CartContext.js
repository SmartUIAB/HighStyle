import React, { useState, useEffect } from "react";
import Context from "./index";
import { toast } from "react-toastify";

const getLocalCartItems = () => {
  try {
    const list = localStorage.getItem("varukorgslista");
    if (list === null) {
      return [];
    } else {
      return JSON.parse(list);
    }
  } catch (err) {
    return [];
  }
};

const CartProvider = (props) => {
  const [cartItems, setCartItems] = useState(getLocalCartItems());
  const [cartTotal, setCartTotal] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState("I lager");

  useEffect(() => {
    const total = cartItems.reduce((a, b) => a + b.total, 0);
    setCartTotal(total);

    localStorage.setItem("varukorgslista", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, quantity) => {
    toast.success("Produkten har lagts till framgångsrikt!");

    const index = cartItems.findIndex(
      (itm) =>
        itm.id === item.id &&
        itm.selectedSize === item.selectedSize &&
        itm.selectedColor === item.selectedColor
    );

    if (index !== -1) {
      const updatedCart = cartItems.map((itm, idx) =>
        idx === index
          ? {
              ...itm,
              qty: itm.qty + quantity,
              total:
                itm.total +
                (item.price - (item.price * item.discount) / 100) * quantity,
            }
          : itm
      );
      setCartItems(updatedCart);
    } else {
      const product = {
        ...item,
        qty: quantity,
        total: (item.price - (item.price * item.discount) / 100) * quantity,
      };
      setCartItems([...cartItems, product]);
    }
  };

  const removeFromCart = (item) => {
    toast.error("Produkten har tagits bort framgångsrikt!");
    setCartItems(cartItems.filter((e) => e.id !== item.id));
  };

  const minusQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      setStock("I lager");
    }
  };

  const plusQty = (item) => {
    if (item.stock >= quantity) {
      setQuantity(quantity + 1);
    } else {
      setStock("Slut i lager!");
    }
  };

  const updateQty = (item, quantity) => {
    if (quantity >= 1) {
      const index = cartItems.findIndex((itm) => itm.id === item.id);
      if (index !== -1) {
        const updatedCart = cartItems.map((itm, idx) =>
          idx === index
            ? {
                ...itm,
                qty: quantity,
                total: item.price * quantity,
              }
            : itm
        );
        setCartItems(updatedCart);
        toast.info("Produktkvantitet uppdaterad!");
      }
    } else {
      toast.error("Ange giltigt antal!");
    }
  };

  return (
    <Context.Provider
      value={{
        ...props,
        state: cartItems,
        cartTotal,
        setQuantity,
        quantity,
        stock,
        addToCart: addToCart,
        removeFromCart: removeFromCart,
        plusQty: plusQty,
        minusQty: minusQty,
        updateQty: updateQty,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default CartProvider;
