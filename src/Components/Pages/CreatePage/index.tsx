import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { Fragment } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import PageTabs from "./PageTabs";

const CreatePage = () => {
  return (
    <Fragment>
      <CommonBreadcrumb title="Create Pages" parent="Pages" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CommonCardHeader title="" />
              <CardBody>
                <div className="feature-coming-soon mb-3 text-center">
                  <p className="text-muted">
                    This option will be enabled in the next version.
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default CreatePage;
