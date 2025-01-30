import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { useQuery } from "@apollo/client";
import { Fragment, useState } from "react";
import { Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import { GET_ORDER_LIST } from "@/GraphQL/Queries/transactionQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
import Pagination from "@/CommonComponents/Pagination";

const SalesOrders = () => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const { data, loading, refetch } = useQuery(GET_ORDER_LIST);
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const formatedDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePageChange = (page: any) => {
    setPage(page)
    refetch({ page });
  };

  const handleRowsPerPageChange = ((event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  });

  return (
    <Fragment>
      <CommonBreadcrumb title={t("sales.orders.title")} parent={t("sales.type")} />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title={t("sales.orders.manageOrder")} />
              <CardBody className="order-datatable">
                {loading ? (
                  <div className="text-center my-5">
                    <Spinner style={{ color: '#ff8084' }} />
                  </div>
                ) : (
                  <table className="table mt-5 w-full" style={{ minWidth: '1200px' }}>
                    <thead>
                      <tr>
                        <th className="text-uppercase">{t("sales.orders.columns.customer")}</th>
                        <th className="text-uppercase">{t("sales.orders.columns.price")}</th>
                        <th className="text-uppercase">{t("sales.orders.columns.paymentStatus")}</th>
                        <th className="text-uppercase">{t("sales.orders.columns.orderStatus")}</th>
                        <th className="text-uppercase">{t("sales.orders.columns.deliveryCity")}</th>
                        <th className="text-uppercase">{t("sales.orders.columns.totalProduct")}</th>
                        <th className="text-uppercase">{t("sales.orders.columns.createdAt")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.getAllOrders.orders?.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center">{t("sales.orders.noOrderFound")}</td>
                        </tr>
                      ) : (
                        data?.getAllOrders.orders?.map((item: any, i: any) => (
                          <tr key={i}>
                            <td className="align-middle">
                              {item?.user?.firstname || "N/A"}
                            </td>
                            <td className="align-middle">{item?.finalTotal}$</td>
                            <td className="align-middle">
                              {item?.paymentStatus || "N/A"}
                            </td>
                            <td className="align-middle">{item.orderStatus || "N/A"}</td>
                            <td className="align-middle">{item?.shippingAddress?.city || "N/A"}</td>
                            <td className="align-middle">
                              {item?.products.reduce((sum: any, item: any) => sum + item.quantity, 0)}
                            </td>
                            <td className="align-middle">{formatedDate(parseInt(item.createdAt))}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
                <Pagination
                  count={data?.getAllOrders.orders?.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default SalesOrders;
