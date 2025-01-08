"use client";
import { useTranslation } from "@/app/i18n/client";
import { useAppSelector } from "@/Redux/Hooks";
import { Col, Container, Row } from "reactstrap";

const Footer = () => {
  const { sidebar } = useAppSelector((store) => store.LayoutReducer);
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  return (
    <div>
      <footer className={`footer ${sidebar && "open"}`}>
        <Container fluid>
          <Row>
            <Col md="6" className="footer-copyright">
              <p className="mb-0">{t("Footer")}</p>
            </Col>
            <Col md="6">
              <p className="pull-right mb-0">
                {t("createdBy")}<i className="fa fa-heart"></i>
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Footer;
