import React from "react";
import { Container, Row, Col } from "reactstrap";
import Link from "next/link";
import LocaleLink from "../../LocaleLink";

const TopBar = ({ topClass }) => {
  return (
    <div id="topHeader" className={`top-header ${topClass ? topClass : ""}`}>
      <Container>
        <Row>
          <Col lg="6">
            <div className="header-contact">
              <ul>
                <li>Välkommen till vår butik High Style</li>
                <li>
                  <i className="fa fa-phone" aria-hidden="true"></i>
                  {"Ring Oss"}: 073 - 550 - 2062
                </li>
              </ul>
            </div>
          </Col>
          <Col lg="6" className="text-end">
            <ul className="header-dropdown">
              <li className="mobile-wishlist compare-mobile">
                <LocaleLink href={`/page/compare`}>
                  <i className="fa fa-random" aria-hidden="true"></i>
                  {"compare"}
                </LocaleLink>
              </li>
              <li className="mobile-wishlist">
                <LocaleLink href={`/page/account/wishlist`}>
                  <i className="fa fa-heart" aria-hidden="true"></i>
                  {"wishlist"}
                </LocaleLink>
              </li>
              <li className="onhover-dropdown mobile-account">
                <i className="fa fa-user" aria-hidden="true"></i> {"My account"}
                <ul className="onhover-show-div">
                  <li>
                    <LocaleLink href={`/page/account/login`}>
                      Logga in
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink href={`/page/account/register`}>
                      Registrera
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
