import { useTranslation } from "@/app/i18n/client";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { GET_ORDER_LIST } from "@/GraphQL/Queries/transactionQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { Button, Card, CardBody, Col, Table } from "reactstrap";

const LatestOrders = () => {
  const { data, loading, refetch } = useQuery(GET_ORDER_LIST);
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  return (
    <Col xl="6 xl-100">
      <Card>
        <CommonCardHeader title={t("latestOrders")} />
        <CardBody>
          <div className="user-status table-responsive latest-order-table">
            <Table borderless>
              <thead>
                <tr>
                  <th scope="col">{t("orderId")}</th>
                  <th scope="col">{t("sales.orders.columns.price")}</th>
                  <th scope="col">{t("sales.orders.columns.paymentStatus")}</th>
                  <th scope="col">{t("sales.orders.columns.orderStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {data?.getAllOrders?.orders.slice(0, 4).map((order: any, index: any) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="digits">$ {order.finalTotal.toFixed(2)}</td>
                    <td className="font-primary">{order.paymentStatus}</td>
                    <td className="digits">{order.orderStatus}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Link href={`/${i18LangStatus}/sales/orders`}>
              <Button color="primary">{t("viewAllOrders")}</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default LatestOrders;
