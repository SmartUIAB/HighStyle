import React from "react";
import CommonLayout from "../../../components/shop/common-layout";
import { Container, Row, Col, Media } from "reactstrap";
import { useQuery } from "@apollo/client";
import { GET_ALL_TRANSACTIONS } from "../../../GraphQL/Queries/transactionQueries";
import {
  GET_DIGITAL_PRODUCT,
  GET_PHYSICAL_PRODUCT,
} from "../../../GraphQL/Queries/productQueries";

const OrderSuccess = () => {
  const { data, loading, error } = useQuery(GET_ALL_TRANSACTIONS);
  const {
    data: allPhysicalProductData,
    loading: loadingPhysical,
    error: errorPhysical,
  } = useQuery(GET_PHYSICAL_PRODUCT);

  const {
    data: allDigitalProductData,
    loading: loadingDigital,
    error: errorDigital,
  } = useQuery(GET_DIGITAL_PRODUCT);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching transactions</p>;

  const transactions = data?.getAllTransactions?.transactions || [];
  const lastTransaction = transactions[transactions.length - 1];

  if (loadingPhysical || loadingDigital) return <p>Loading products...</p>;
  if (errorPhysical || errorDigital) return <p>Error fetching products</p>;

  const mergedProducts = [
    ...(allPhysicalProductData?.physicalProducts?.products || []),
    ...(allDigitalProductData?.digitalProducts?.products || []),
  ];

  // Filter products that match the IDs in lastTransaction.order.products
  const matchingProducts = mergedProducts.filter((product) =>
    lastTransaction?.order?.products.some(
      (orderProduct) => orderProduct.productId === product.id
    )
  );

  return (
    <CommonLayout parent="home" title="order success">
      <section className="section-b-space light-layout white-1">
        <Container>
          <Row>
            <Col md="12">
              <div className="success-text">
                <i className="fa fa-check-circle" aria-hidden="true"></i>
                <h2>Thank you</h2>
                <p>
                  Payment has been successfully processed, and your order is on
                  the way.
                </p>
                <p>Transaction ID: {lastTransaction?.transactionId}</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section-b-space">
        <Container>
          <Row>
            <Col lg="6">
              <div className="product-order">
                <h3>Your Order Details</h3>
                <div className="order-details-container">
                  {matchingProducts.map((product, index) => (
                    <Row className="product-order-detail" key={index}>
                      <Col xs="4" className="order-image">
                        <Media
                          src={
                            process.env.NEXT_PUBLIC_API_KEY + product.images[0]
                          }
                          alt={product.title}
                          className="img-fluid"
                        />
                      </Col>
                      <Col xs="8" className="order-details">
                        <h5 className="product-title">{product.title}</h5>
                        <p className="product-description">
                          {product.description}
                        </p>
                        <div className="product-info">
                          <p>
                            <strong>SKU:</strong> {product.SKU}
                          </p>
                          <p>
                            <strong>Price:</strong> ${product.price}
                          </p>
                          <p>
                            <strong>Discount:</strong> {product.discount}%
                          </p>
                        </div>
                      </Col>
                    </Row>
                  ))}
                </div>

                <div className="total-sec">
                  <ul>
                    <li>
                      Subtotal{" "}
                      <span>${lastTransaction?.order?.finalTotal}</span>
                    </li>
                  </ul>
                </div>
                <div className="final-total">
                  <h3>
                    Total <span>${lastTransaction?.transactionAmount}</span>
                  </h3>
                </div>
              </div>
            </Col>
            <Col lg="6">
              <Row className="order-success-sec">
                <Col sm="6">
                  <h4>Summary</h4>
                  <ul className="order-detail">
                    <li>Order ID: {lastTransaction?.order?.id}</li>
                    <li>
                      Order Date:{" "}
                      {new Date(
                        parseInt(lastTransaction?.order?.createdAt, 10)
                      ).toLocaleDateString()}
                    </li>
                    <li>Order Total: ${lastTransaction?.order?.finalTotal}</li>
                  </ul>
                </Col>
                <Col sm="6">
                  <h4>Shipping Address</h4>
                  <ul className="order-detail">
                    <li>{`${lastTransaction?.order?.user?.firstname} ${lastTransaction?.order?.user?.lastname}`}</li>
                    <li>{lastTransaction?.order?.shippingAddress?.street}</li>
                    <li>{`${lastTransaction?.order?.shippingAddress?.city}, ${lastTransaction?.order?.shippingAddress?.state}`}</li>
                    <li>
                      {lastTransaction?.order?.shippingAddress?.postalCode},{" "}
                      {lastTransaction?.order?.shippingAddress?.country}
                    </li>
                  </ul>
                </Col>
                <Col sm="12" className="payment-mode">
                  <h4>Payment Method</h4>
                  <p>
                    Payment Gateway: {lastTransaction?.paymentGateway}. The
                    payment was{" "}
                    <strong>{lastTransaction?.transactionStatus}</strong>.
                  </p>
                </Col>
                <Col md="12">
                  <div className="delivery-sec">
                    <h3>Expected Date of Delivery</h3>
                    <h2>
                      {new Date(
                        parseInt(lastTransaction?.order?.updatedAt, 10)
                      ).toLocaleDateString()}
                    </h2>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>
    </CommonLayout>
  );
};

export default OrderSuccess;
