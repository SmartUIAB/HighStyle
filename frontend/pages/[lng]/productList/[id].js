import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Carousel,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import {
  GET_DIGITAL_PRODUCT,
  GET_PHYSICAL_PRODUCT,
} from "../../../GraphQL/Queries/productQueries";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import CommonLayout from "../../../components/shop/common-layout";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import LocalLink from "../../../components/LocalLink";

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query || {};

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

  console.log("mergedProducts", mergedProducts);

  const loading = loadingPhysical || loadingDigital;

  if (errorPhysical || errorDigital) {
    return (
      <CommonLayout
        parent={t("productlist.route_name.product_list")}
        title={t("productlist.route_name.product_list")}
      >
        <Container className="mt-4">
          <Alert variant="danger">
            <h4>{t("productlist.error.loading_products")}</h4>
            <p>{t("productlist.error.issue_loading")}.</p>
          </Alert>
        </Container>
      </CommonLayout>
    );
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredProducts = mergedProducts
    .filter((product) => product.subcategory.id === id) // Filter by subcategory ID if available
    .filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) // Filter by search term
    );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <CommonLayout
        parent="Product"
        title={t("productlist.route_name.product_list")}
      >
        <Container className="mt-4">
          {!loading && filteredProducts.length > 0 && (
            <Form className="mb-4">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder={t("productlist.placeholder.search_products")}
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </InputGroup>
            </Form>
          )}

          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "50vh" }}
            >
              <Spinner animation="border" variant="primary" />
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <Row>
                {currentProducts.map((product) => (
                  <Col md={4} sm={6} xs={12} key={product.id} className="mb-4">
                    <LocalLink href={`/product-details/${product.id}`} passHref>
                      <Card className="h-100 shadow-sm">
                        {product.images && product.images.length > 1 ? (
                          <Carousel interval={null} className="p-3">
                            {product.images.map((image, index) => (
                              <Carousel.Item key={index}>
                                <img
                                  src={process.env.NEXT_PUBLIC_API_KEY + image}
                                  alt={product.title}
                                  className="d-block w-100"
                                  style={{
                                    height: "200px",
                                    objectFit: "cover",
                                  }}
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
                            <strong>{t("productlist.details.price")}: </strong>
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
                                <strong>
                                  {t("productlist.details.colors")}:{" "}
                                </strong>
                                {product.colors.join(", ")}
                                <br />
                              </>
                            )}
                            {product.sizes && product.sizes.length > 0 && (
                              <>
                                <strong>
                                  {t("productlist.details.sizes")}:{" "}
                                </strong>
                                {product.sizes.join(", ")}
                                <br />
                              </>
                            )}
                            {product.fileFormat && (
                              <>
                                <strong>
                                  {t("productlist.details.file_format")}:{" "}
                                </strong>
                                {product.fileFormat}
                                <br />
                              </>
                            )}
                            {product.fileSize && (
                              <>
                                <strong>
                                  {t("productlist.details.file_size")}:{" "}
                                </strong>
                                {product.fileSize}
                                <br />
                              </>
                            )}
                            {product.compatibility &&
                              product.compatibility.length > 0 && (
                                <>
                                  <strong>
                                    {t("productlist.details.compatibility")}:{" "}
                                  </strong>
                                  {product.compatibility.join(", ")}
                                  <br />
                                </>
                              )}
                            <strong>{t("productlist.details.status")}: </strong>
                            <span
                              className={
                                product.status === "Available"
                                  ? "text-primary"
                                  : "text-danger"
                              }
                            >
                              {product.status === "Available"
                                ? t("productlist.status.available")
                                : t("productlist.status.out_of_stock")}
                            </span>
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </LocalLink>
                  </Col>
                ))}
              </Row>

              <Pagination className="justify-content-center mt-4 mb-4">
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                />
                {[...Array(totalPages).keys()].map((page) => (
                  <Pagination.Item
                    key={page + 1}
                    active={page + 1 === currentPage}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    {page + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </Pagination>
            </>
          ) : (
            <Alert variant="info">
              <h4>{t("productlist.info.no_products_found")}</h4>
              <p>{t("productlist.info.adjust_filters")}</p>
            </Alert>
          )}
        </Container>
      </CommonLayout>
    </>
  );
};

export default ProductList;
