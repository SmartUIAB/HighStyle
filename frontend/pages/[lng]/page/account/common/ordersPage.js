import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Spinner,
  Pagination,
  PaginationItem,
  PaginationLink,
  Input,
} from "reactstrap";
import { GET_MY_ORDERS } from "../../../../../GraphQL/Queries/orderQueries";
import LocalLink from "../../../../../components/LocalLink";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const OrdersPage = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  useEffect(() => {
    // Check customerDetail in localStorage
    let customerDetail = null;
    try { customerDetail = JSON.parse(window.localStorage.getItem("customerDetail") || "null"); } catch (_) {}
    setUserData(customerDetail);
    if (
      !customerDetail ||
      customerDetail === "null" ||
      customerDetail === "{}"
    ) {
      router.replace("/page/account/login"); // Redirect to login page if empty
    }
  }, []);
  const [userData, setUserData] = useState(null);

  const {
    data: myorder,
    loading,
    error,
    refetch,
  } = useQuery(GET_MY_ORDERS, {
    variables: {
      customerId: userData?.id || "000000000000000000000000",
    },
    skip: !userData?.id,
  });
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <p className="text-danger">
          {t("myOrders.errorMessage", { error: error.message })}
        </p>
      </div>
    );
  }

  const orders = myorder?.GetMyOrder || [];

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp, 10));
    return date.toLocaleDateString();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  return (
    <section className="my-orders py-5">
      <Container>
        <Row>
          <Col>
            <h2 className="mb-4 text-center">{t("myOrders.myOrders")}</h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Input
                type="text"
                placeholder={t("myOrders.searchPlaceholder")}
                value={searchTerm}
                onChange={handleSearch}
                className="w-50"
              />
              <Button color="primary" onClick={() => refetch()}>
                <i className="fa fa-refresh"></i>
              </Button>
            </div>
            {filteredOrders.length === 0 ? (
              <div className="text-center">
                <p>{t("myOrders.noOrdersFound")}</p>
              </div>
            ) : (
              <>
                <Table striped bordered hover>
                  <thead className="thead-dark">
                    <tr>
                      <th>{t("myOrders.number")}</th>
                      <th>{t("myOrders.orderId")}</th>
                      <th>{t("myOrders.date")}</th>
                      <th>{t("myOrders.total")}</th>
                      <th>{t("myOrders.status")}</th>
                      <th>{t("myOrders.items")}</th>
                      <th>{t("myOrders.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order, index) => (
                      <tr key={order.id}>
                        <td>{indexOfFirstOrder + index + 1}</td>
                        <td>{order.id}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>${order.finalTotal.toFixed(2)}</td>
                        <td>
                          <span
                            className={`badge ${
                              order.orderStatus === "PENDING"
                                ? "bg-secondary"
                                : order.orderStatus === "SHIPPED"
                                ? "bg-primary"
                                : order.orderStatus === "DELIVERED"
                                ? "bg-info"
                                : order.orderStatus === "COMPLETED"
                                ? "bg-success"
                                : order.orderStatus === "CANCELED"
                                ? "bg-danger"
                                : "bg-warning"
                            }`}
                          >
                            {t(
                              `orderStatus.${order.orderStatus.toLowerCase()}`
                            )}
                          </span>
                        </td>

                        <td>
                          {order.products.map((product, i) => (
                            <div key={i}>
                              {product.productType} - {product.quantity}{" "}
                              {t("myOrders.items")}
                            </div>
                          ))}
                        </td>
                        <td>
                          {order.products.map((product, i) => (
                            <LocalLink
                              href={`/product-details/${product.productId}`}
                              passHref
                              key={i}
                            >
                              <Button
                                color="primary"
                                size="sm"
                                className="me-2"
                              >
                                {t("myOrders.viewProduct")} {i + 1}
                              </Button>
                            </LocalLink>
                          ))}
                          {order.orderStatus !== "Cancelled" && (
                            <Button
                              color="secondary"
                              size="sm"
                              onClick={() =>
                                alert(`${t("myOrders.trackOrder")} ${order.id}`)
                              }
                            >
                              {t("myOrders.trackOrder")}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <PaginationItem disabled={currentPage === 1}>
                      <PaginationLink
                        previous
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem active={i + 1 === currentPage} key={i}>
                        <PaginationLink onClick={() => handlePageChange(i + 1)}>
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem disabled={currentPage === totalPages}>
                      <PaginationLink
                        next
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                    </PaginationItem>
                  </Pagination>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default OrdersPage;
