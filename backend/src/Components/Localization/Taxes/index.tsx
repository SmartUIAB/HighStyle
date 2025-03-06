import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
// import Datatable from "@/CommonComponents/DataTable";
import { TaxesData } from "@/Data/Localization";
import { Fragment, useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row, Spinner } from "reactstrap";

const Taxes = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <Fragment>
      <CommonBreadcrumb title="Taxes Rates" parent="Localization" />
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

export default Taxes;
