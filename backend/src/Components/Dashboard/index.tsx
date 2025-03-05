import { Fragment } from "react";
import { ArcElement, BarController, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LineElement, LinearScale, PointElement, RadialLinearScale, Title, Tooltip } from "chart.js";
import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import dynamic from "next/dynamic";
import { Container, Row } from "reactstrap";
import BuySell from "./BuySell";
import DailyDeposits from "./DailyDeposits";
import EmployeeStatus from "./EmployeeStatus";
import LatestOrders from "./LatestOrders";
import ProductCart from "./ProductCart";
import SalesStatus from "./SalesStatus";
import TopDashboardCards from "./TopDashboardCards";
import TotalCash from "./TotalCash";
import TotalPurchase from "./TotalPurchase";
import TotalSales from "./TotalSales";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
const MarketValue = dynamic(() => import("./MarketValue"), { ssr: false });

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarController, BarElement, ArcElement, Filler, RadialLinearScale);

const DashboardContainer = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  return (
    <Fragment>
      <CommonBreadcrumb title={t("Dashboard")} parent={t("Dashboard")} />
      <Container fluid>
        <Row>
          <TopDashboardCards />
          <MarketValue />
          <LatestOrders />
          <TotalSales />
          <TotalPurchase />
          <TotalCash />
          <DailyDeposits />
          <BuySell />
          <ProductCart />
          <EmployeeStatus />
          <SalesStatus />
        </Row>
      </Container>
    </Fragment>
  );
};

// javascript:void(0)

export default DashboardContainer;
