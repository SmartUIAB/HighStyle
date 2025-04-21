import React from "react";
import CommonLayout from "../../../components/shop/common-layout";
// import { withApollo } from '../../helpers/apollo/apollo';
import { Row, Container, Col } from "reactstrap";
import Products from "../../../components/common/Collections/Collection3";

const FullWidth = () => {
  return (
    <CommonLayout title="collection" parent="home">
      <Container fluid={true}>
        <Row>
          <Col sm="12">
            <Products type="metro" col="full" />
          </Col>
        </Row>
      </Container>
    </CommonLayout>
  );
};

export default FullWidth;
