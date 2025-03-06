import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const Context = createContext({
  compareItems: Function,
  addToCompare: Function,
  removeFromComapre: Function,
});

const getLocalCompareItems = () => {
  try {
    const list = localStorage.getItem("jämföra");
    if (list === null) {
      return [];
    } else {
      return JSON.parse(list);
    }
  } catch (err) {
    return [];
  }
};

export const Provider = (props) => {
  const [compareItems, setcompareItems] = useState(getLocalCompareItems());

  useEffect(() => {
    localStorage.setItem("jämföra", JSON.stringify(compareItems));
  }, [compareItems]);

  // Add Product To Wishlist
  const addToCompare = (item) => {
    const index = compareItems.findIndex((compare) => compare.id === item.id);
    if (index === -1) {
      toast.success("Produkten har lagts till framgångsrikt!");
      setcompareItems([...compareItems, item]);
    } else {
      toast.error("Denna produkt har redan lagts till!");
    }
  };

  // Remove Product From compare
  const removeFromComapre = (item) => {
    setcompareItems(compareItems.filter((e) => e.id !== item.id));
    toast.error("Produkten har tagits bort framgångsrikt!");
  };

  return (
    <Context.Provider
      value={{
        compareItems: compareItems,
        addToCompare: addToCompare,
        removeFromComapre: removeFromComapre,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export {
  Context as CompareContext,
  Provider as CompareContextProvider,
} from "./CompareContext";
