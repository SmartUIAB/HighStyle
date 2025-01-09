import { useTranslation } from "@/app/i18n/client";
import { useAppSelector } from "@/Redux/Hooks";
import { CommonBreadcrumbType } from "@/Types/Layout";
import Link from "next/link";
import { Home } from "react-feather";
import { Breadcrumb, BreadcrumbItem, Col, Container, Row } from "reactstrap";

const CommonBreadcrumb = ({ title, parent }: CommonBreadcrumbType) => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  const lang = localStorage.getItem("i18nextLng")
  return (
    <Container fluid>
      <div className="page-header">
        <Row>
          <Col lg="6">
            <div className="page-header-left">
              <h3>
                {title}
                <small>{t("digital.add_product.Multikart Admin panel")}</small>
              </h3>
            </div>
          </Col>
          <Col lg="6">
            <Breadcrumb className=" pull-right">
              <BreadcrumbItem>
                <Link href={`/${lang}/dashboard`}>
                  <Home />
                </Link>
              </BreadcrumbItem>
              <BreadcrumbItem>{parent}</BreadcrumbItem>
              <BreadcrumbItem className=" active">{title}</BreadcrumbItem>
            </Breadcrumb>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default CommonBreadcrumb;
