import React from "react";
import { Container, Row, Col } from "reactstrap";
import Link from "next/link";

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
                <Link href={`/page/compare`}>
                  <i className="fa fa-random" aria-hidden="true"></i>
                  {"compare"}
                </Link>
              </li>
              <li className="mobile-wishlist">
                <Link href={`/page/account/wishlist`}>
                  <i className="fa fa-heart" aria-hidden="true"></i>
                  {"wishlist"}
                </Link>
              </li>
              <li className="onhover-dropdown mobile-account">
                <i className="fa fa-user" aria-hidden="true"></i> {"My account"}
                <ul className="onhover-show-div">
                  <li>
                    <Link href={`/page/account/login`}>Logga in</Link>
                  </li>
                  <li>
                    <Link href={`/page/account/register`}>Registrera</Link>
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
