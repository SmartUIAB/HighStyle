import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { useQuery } from "@apollo/client";
import { Fragment } from "react";
import { Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import { GET_TRANSACTION } from "../../../GraphQL/Queries/transactionQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const SalesTransaction = () => {
  const { data, loading, refetch } = useQuery(GET_TRANSACTION);
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const formatedDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Fragment>
      <CommonBreadcrumb title={t("sales.transactions.title")} parent={t("sales.type")} />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title={t("sales.transactions.details")} />
              <CardBody>
                <div id="batchDelete" className="transactions">
                  {/* Loader */}
                  {loading ? (
                    <div className="text-center my-5">
                      <Spinner style={{ color: '#ff8084' }} />
                    </div>
                  ) : (
                    <table className="table mt-5 w-full" style={{ minWidth: '1200px' }}>
                      <thead>
                        <tr>
                          <th className="text-uppercase">{t("sales.transactions.columns.customer")}</th>
                          <th className="text-uppercase">{t("sales.transactions.columns.price")}</th>
                          <th className="text-uppercase">{t("sales.transactions.columns.paymentStatus")}</th>
                          <th className="text-uppercase">{t("sales.transactions.columns.orderStatus")}</th>
                          <th className="text-uppercase">{t("sales.transactions.columns.deliveryCity")}</th>
                          <th className="text-uppercase">{t("sales.transactions.columns.transactionId")}</th>
                          <th className="text-uppercase">{t("sales.transactions.columns.createdAt")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.getAllTransactions?.transactions?.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center">{t("sales.transactions.noTransactionFound")}</td>
                          </tr>
                        ) : (
                          data?.getAllTransactions?.transactions.map((item: any, i: any) => (
                            <tr key={i}>
                              <td className="align-middle">
                                {item?.order?.user?.firstname || "N/A"}
                              </td>
                              <td className="align-middle">{item?.order?.finalTotal}$</td>
                              <td className="align-middle">
                                {item?.order?.paymentStatus || "N/A"}
                              </td>
                              <td className="align-middle">{item.order?.orderStatus || "N/A"}</td>
                              <td className="align-middle">{item?.order?.shippingAddress?.city || "N/A"}</td>
                              <td className="align-middle">{item.transactionId}</td>
                              <td className="align-middle">{formatedDate(parseInt(item.createdAt))}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default SalesTransaction;
