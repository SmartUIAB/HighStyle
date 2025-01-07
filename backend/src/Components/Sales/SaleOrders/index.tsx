import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { useQuery } from "@apollo/client";
import { Fragment } from "react";
import { Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import { GET_ORDER_LIST } from "@/GraphQL/Queries/transactionQueries";

const SalesOrders = () => {

  const { data, loading, refetch } = useQuery(GET_ORDER_LIST);

  const formatedDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Fragment>
      <CommonBreadcrumb title="Orders" parent="Sales" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title="Manage Order" />
              <CardBody className="order-datatable">
                {loading ? (
                  <div className="text-center my-5">
                    <Spinner style={{ color: '#ff8084' }} />
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
                        <th className="text-uppercase">Total Product</th>
                        <th className="text-uppercase">Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.getAllOrders.orders?.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center">No Order Found</td>
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
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default SalesOrders;
