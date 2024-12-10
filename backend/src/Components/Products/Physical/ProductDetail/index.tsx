'use client'

import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { Card, CardBody, Container, Row, Spinner } from "reactstrap";
import ProductDetailSlider from "./ProductDetailSlider";
import ProductInformation from "./ProductInformation";
import { useQuery } from "@apollo/client";
import { PHYSICAL_PRODUCT_BY_ID } from "@/GraphQL/Queries/productQueries";
import { useSearchParams } from "next/navigation";

const ProductDetail = () => {
  const searchParams = useSearchParams()
  const id = searchParams.get('id');

  const { data: physicalProductByID, loading, error } = useQuery(PHYSICAL_PRODUCT_BY_ID, {
    variables: {
      physicalProductId: id,
    }
  });

  if (loading) {
    return (
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
          <Spinner style={{ width: '3rem', height: '3rem', color: '#ff8084' }} />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
          <h3>Error: {error.message}</h3>
        </div>
      </Container>
    );
  }

  return (
    <>
      <CommonBreadcrumb title="Product Detail" parent="Physical" />
      <Container fluid>
        <Card>
          <CardBody>
            <Row className="product-page-main">
              <ProductDetailSlider data={physicalProductByID?.physicalProduct.images} />
              <ProductInformation data={physicalProductByID?.physicalProduct} />
            </Row>
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default ProductDetail;

