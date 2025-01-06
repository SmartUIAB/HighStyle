import Link from "next/link";
import { Col, Container, Row } from "reactstrap";
import LocaleLink from "../../../../../components/LocaleLink";
import { useTranslation } from "react-i18next";

const MasterBanner = ({ img, title, desc, link, classes, btn, btnClass }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className={`home ${img} ${classes ? classes : "text-center"}`}>
        <Container>
          <Row>
            <Col>
              <div className="slider-contain">
                <div>
                  <h4>{title}</h4>
                  <h1>{desc}</h1>
                  <LocaleLink
                    href={link}
                    className={`btn ${btnClass ? btnClass : "btn-solid"}`}
                  >
                    {/* <a > */}
                    {btn ? btn : t("landing_page.shop_now")} {/* </a> */}
                  </LocaleLink>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default MasterBanner;
