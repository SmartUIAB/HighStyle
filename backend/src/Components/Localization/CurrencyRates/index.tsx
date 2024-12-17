import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { CurrencyRatesData } from "@/Data/Localization";
import React, { Fragment, useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row, Spinner } from "reactstrap";

const CurrencyRates = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <Fragment>
      <CommonBreadcrumb title="Currency Rates" parent="Localization" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CardHeader>
                <h5>Currency Details</h5>
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
                          <th className="text-uppercase">Title</th>
                          <th className="text-uppercase">USD</th>
                          <th className="text-uppercase">Rate</th>
                          <th className="text-uppercase">Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CurrencyRatesData?.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center">No Data Found</td>
                          </tr>
                        ) : (
                          CurrencyRatesData?.map((item: any, i: any) => (
                            <tr key={i}>
                              <td className="d-flex gap-2">
                                {item.title}
                              </td>
                              <td className="align-middle">{item.usd}</td>
                              <td className="align-middle">{item.rate}</td>
                              <td className="align-middle">{item.code}</td>
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

export default CurrencyRates;
