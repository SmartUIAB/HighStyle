import React from "react";
import { Container, Row, Col, Table, Button } from "reactstrap";

const OrdersPage = () => {
  const orders = [
    {
      orderId: "123456",
      date: "2025-01-14",
      total: "$120.00",
      status: "Delivered",
      items: 3,
    },
    {
      orderId: "123457",
      date: "2025-01-10",
      total: "$80.00",
      status: "In Transit",
      items: 2,
    },
    {
      orderId: "123458",
      date: "2025-01-05",
      total: "$150.00",
      status: "Cancelled",
      items: 5,
    },
  ];

  return (
    <section className="my-orders py-5">
      <Container>
        <Row>
          <Col>
            <Table striped bordered hover>
              <thead className="thead-dark">
                <tr>
                  <th>No.</th>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.orderId}>
                    <td>{index + 1}</td>
                    <td>{order.orderId}</td>
                    <td>{order.date}</td>
                    <td>{order.total}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === "Delivered"
                            ? "bg-success"
                            : order.status === "In Transit"
                            ? "bg-warning"
                            : "bg-danger"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{order.items}</td>
                    <td>
                      <Button
                        color="primary"
                        size="sm"
                        className="me-2"
                        onClick={() =>
                          alert(
                            `Viewing details for Order ID: ${order.orderId}`
                          )
                        }
                      >
                        View Details
                      </Button>
                      {order.status !== "Cancelled" && (
                        <Button
                          color="secondary"
                          size="sm"
                          onClick={() =>
                            alert(`Tracking Order ID: ${order.orderId}`)
                          }
                        >
                          Track Order
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default OrdersPage;
