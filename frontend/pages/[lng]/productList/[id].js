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
import CommonLayout from "../../../components/shop/common-layout";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import LocalLink from "../../../components/LocalLink";

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("");
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
    setSearchTerm(e.target.value.trim());
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  let filteredProducts = mergedProducts
    .filter((product) => product.subcategory.id === id)
    .filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (sortOrder === "lowToHigh") {
    filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "highToLow") {
    filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
  }

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
          <Form className="mb-4">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder={t("productlist.placeholder.search_products")}
                value={searchTerm}
                onChange={handleSearch}
              />
              <Form.Select
                value={sortOrder}
                onChange={handleSortChange}
                className="ms-2"
              >
                <option value="">{t("productlist.sort.default")}</option>
                <option value="lowToHigh">
                  {t("productlist.sort.lowtohigh")}
                </option>
                <option value="highToLow">
                  {t("productlist.sort.hightolow")}
                </option>
              </Form.Select>
            </InputGroup>
          </Form>

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
                              ${product.price.toFixed(2)}
                            </span>{" "}
                            {product.discount && (
                              <s className="text-muted">${product.price}</s>
                            )}
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
