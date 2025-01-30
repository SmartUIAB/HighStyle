import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
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
              <CardHeader>
                <h5>Tax Details</h5>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="text-center">
                    <Spinner style={{ color: '#ff8084' }} />
                  </div>
                ) : (
                  <div id="basicScenario" className="product-list translation-list">
                    <table className="table mt-5 w-full" style={{ minWidth: '1200px' }}>
                      <thead>
                        <tr>
                          <th className="text-uppercase">Detail</th>
                          <th className="text-uppercase">Schedule</th>
                          <th className="text-uppercase">Rate</th>
                          <th className="text-uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TaxesData?.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center">No Data Found</td>
                          </tr>
                        ) : (
                          TaxesData?.map((item, i) => (
                            <tr key={i}>
                              <td className="align-middle">{item.detail}</td>
                              <td className="align-middle">{item.schedule}</td>
                              <td className="align-middle">{item.rate}</td>
                              <td className="align-middle">{item.amount}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Taxes;
