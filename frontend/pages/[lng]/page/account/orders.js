import React from "react";
import CommonLayout from "../../../../components/shop/common-layout";
import { useTranslation } from "react-i18next";
import OrdersPage from "./common/ordersPage";

const orders = () => {
  const { t } = useTranslation();
  return (
    <CommonLayout parent="Home" title="Orders">
      <OrdersPage />
    </CommonLayout>
  );
};

export default orders;
