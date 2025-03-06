import React from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col } from "reactstrap";

const Paragraph = ({ title, inner, line, hrClass }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className={title}>
        <h4>{t("landing_page.special_offer")}</h4>
        <h2 className={inner}>{t("landing_page.top_collection")}</h2>
        {line ? (
          <div className="line"></div>
        ) : hrClass ? (
          <hr role="tournament6"></hr>
        ) : (
          ""
        )}
      </div>
      <Container>
        <Row>
          <Col lg="6" className="m-auto">
            <div className="product-para">
              <p className="text-center">{t("landing_page.discover_offer")}</p>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Paragraph;
