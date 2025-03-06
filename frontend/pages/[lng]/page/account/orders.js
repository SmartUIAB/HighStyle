import React from "react";
import CommonLayout from "../../../../components/shop/common-layout";
import { useTranslation } from "react-i18next";
import OrdersPage from "./common/ordersPage";

const orders = () => {
  const { t } = useTranslation();
  return (
    <CommonLayout parent={t("compare.home")} title={t("myOrders.myOrders")}>
      <OrdersPage />
    </CommonLayout>
  );
};

export default orders;
