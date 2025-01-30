import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { TranslationData } from "@/Data/Localization";
import { Fragment, useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col, Container, Row, Spinner } from "reactstrap";

const Translations = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <Fragment>
      <CommonBreadcrumb title="Translations" parent="Localization" />
      <Container fluid>
        <Row>
          <Col sm="12">
            <Card>
              <CardHeader>
                <h5>Translation Details</h5>
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
                          <th className="text-uppercase">Key</th>
                          <th className="text-uppercase">English</th>
                          <th className="text-uppercase">Russian</th>
                          <th className="text-uppercase">Arabic</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TranslationData?.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center">No Data Found</td>
                          </tr>
                        ) : (
                          TranslationData?.map((item, i) => (
                            <tr key={i}>
                              <td className="align-middle">{item.user_key}</td>
                              <td className="align-middle">{item.english}</td>
                              <td className="align-middle">{item.russian}</td>
                              <td className="align-middle">{item.arabic}</td>
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

export default Translations;
