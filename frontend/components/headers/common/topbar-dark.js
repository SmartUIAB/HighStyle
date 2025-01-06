import React from "react";
import { Container, Row, Col } from "reactstrap";
import LocaleLink from "../../LocaleLink";
import { useTranslation } from "react-i18next";

const TopBar = ({ topClass }) => {
  const { t } = useTranslation();

  return (
    <div id="topHeader" className={`top-header ${topClass ? topClass : ""}`}>
      <Container>
        <Row>
          <Col lg="6">
            <div className="header-contact">
              <ul>
                <li>{t("top_header.welcome")}</li>
                <li>
                  <i className="fa fa-phone" aria-hidden="true"></i>
                  {t("top_header.call_us")}
                </li>
              </ul>
            </div>
          </Col>
          <Col lg="6" className="text-end">
            <ul className="header-dropdown">
              <li className="mobile-wishlist compare-mobile">
                <LocaleLink href={`/page/compare`}>
                  <i className="fa fa-random" aria-hidden="true"></i>
                  {t("top_header.compare")}
                </LocaleLink>
              </li>
              <li className="mobile-wishlist">
                <LocaleLink href={`/page/account/wishlist`}>
                  <i className="fa fa-heart" aria-hidden="true"></i>
                  {t("top_header.wishlist")}
                </LocaleLink>
              </li>
              <li className="onhover-dropdown mobile-account">
                <i className="fa fa-user" aria-hidden="true"></i>{" "}
                {t("top_header.my_account")}
                <ul className="onhover-show-div">
                  <li>
                    <LocaleLink href={`/page/account/login`}>
                      {t("top_header.login")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href={`/page/account/register`}>
                      {t("top_header.register")}
                    </LocaleLink>
                  </li>
                </ul>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TopBar;
