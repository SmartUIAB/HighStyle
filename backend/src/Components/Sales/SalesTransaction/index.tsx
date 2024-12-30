import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import Datatable from "@/CommonComponents/DataTable";
import { useQuery } from "@apollo/client";
import { Fragment } from "react";
import { Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import { GET_TRANSACTION } from "../../../GraphQL/Queries/transactionQueries";

const SalesTransaction = () => {
  const { data, loading, refetch } = useQuery(GET_TRANSACTION);

  const formatedDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Fragment>
      <CommonBreadcrumb title="Transactions" parent="Sales" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title="Transaction Details" />
              <CardBody>
                <div id="batchDelete" className="transactions">
                  {/* Loader */}
                  {loading ? (
                    <div className="text-center my-5">
                      <Spinner style={{ width: '3rem', height: '3rem' }} />
                      <p>Loading Transactions...</p>
                    </div>
                  ) : (
                    <table className="table mt-5 w-full" style={{ minWidth: '1200px' }}>
                      <thead>
                        <tr>
                          <th className="text-uppercase">Customer</th>
                          <th className="text-uppercase">Price</th>
                          <th className="text-uppercase">Payment Status</th>
                          <th className="text-uppercase">Order Status</th>
                          <th className="text-uppercase">Delivery City</th>
                          <th className="text-uppercase">Transaction ID</th>
                          <th className="text-uppercase">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.getAllTransactions?.transactions?.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center">No Data Found</td>
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
