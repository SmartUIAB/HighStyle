import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Carousel,
} from "react-bootstrap";
import {
  GET_DIGITAL_PRODUCT,
  GET_PHYSICAL_PRODUCT,
} from "../../../GraphQL/Queries/productQueries";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import CommonLayout from "../../../components/shop/common-layout";
import LocaleLink from "../../../components/LocaleLink";
import { useTranslation } from "react-i18next";

const ProductList = () => {
  const { t } = useTranslation();

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

  const mergedProducts = [
    ...(allPhysicalProductData?.physicalProducts?.products || []),
    ...(allDigitalProductData?.digitalProducts?.products || []),
  ];

  const loading = loadingPhysical || loadingDigital;

  if (errorPhysical || errorDigital) {
    return (
      <CommonLayout parent="Product" title={t("route_name.product_list")}>
        <Container className="mt-4">
          <Alert variant="danger">
            <h4>Error loading products!</h4>
            <p>
              There was an issue loading the product data. Please try again
              later.
            </p>
          </Alert>
        </Container>
      </CommonLayout>
    );
  }

  return (
    <>
      <CommonLayout
        parent={t("route_name.product")}
        title={t("route_name.product_list")}
      >
        <Container className="mt-4">
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "50vh" }}
            >
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Row>
              {mergedProducts?.map((product) => (
                <Col md={4} sm={6} xs={12} key={product.id} className="mb-4">
                  <LocaleLink href={`/product-details/${product.id}`} passHref>
                    <Card className="h-100 shadow-sm">
                      {product.images && product.images.length > 1 ? (
                        <Carousel interval={null} className="p-3">
                          {product.images.map((image, index) => (
                            <Carousel.Item key={index}>
                              <img
                                src={process.env.NEXT_PUBLIC_API_KEY + image}
                                alt={product.title}
                                className="d-block w-100"
                                style={{ height: "200px", objectFit: "cover" }}
                              />
                            </Carousel.Item>
                          ))}
                        </Carousel>
                      ) : (
                        <Card.Img
                          variant="top"
                          src={
                            process.env.NEXT_PUBLIC_API_KEY +
                            (product.images?.[0] || "/default-image.jpg")
                          }
                          alt={product.title}
                          className="p-3"
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                      )}
                      <Card.Body className="d-flex flex-column">
                        <Card.Title
                          className="text-truncate"
                          title={product.title}
                        >
                          {product.title}
                        </Card.Title>
                        <Card.Text
                          className="text-muted mb-2"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {product.description}
                        </Card.Text>
                        <Card.Text className="mt-auto">
                          <strong>Price: </strong>
                          <span className="text-success">
                            $
                            {(
                              product.price -
                              (product.price * (product.discount || 0)) / 100
                            ).toFixed(2)}
                          </span>{" "}
                          {product.discount && (
                            <s className="text-muted">${product.price}</s>
                          )}
                          <br />
                          {product.colors && product.colors.length > 0 && (
                            <>
                              <strong>Colors: </strong>
                              {product.colors.join(", ")}
                              <br />
                            </>
                          )}
                          {product.sizes && product.sizes.length > 0 && (
                            <>
                              <strong>Sizes: </strong>
                              {product.sizes.join(", ")}
                              <br />
                            </>
                          )}
                          {product.fileFormat && (
                            <>
                              <strong>File Format: </strong>
                              {product.fileFormat}
                              <br />
                            </>
                          )}
                          {product.fileSize && (
                            <>
                              <strong>File Size: </strong>
                              {product.fileSize}
                              <br />
                            </>
                          )}
                          {product.compatibility &&
                            product.compatibility.length > 0 && (
                              <>
                                <strong>Compatibility: </strong>
                                {product.compatibility.join(", ")}
                                <br />
                              </>
                            )}
                          <strong>Status: </strong>
                          <span
                            className={
                              product.status === "Available"
                                ? "text-primary"
                                : "text-danger"
                            }
                          >
                            {product.status === "Available"
                              ? "Available"
                              : "Out of Stock"}
                          </span>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </LocaleLink>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </CommonLayout>
    </>
  );
};

export default ProductList;
