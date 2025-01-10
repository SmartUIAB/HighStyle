import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import LocalLink from "../../LocalLink";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client";
import { LOGOUT_USER } from "../../../GraphQL/Mutations/authMutations";

const TopBar = ({ topClass }) => {
  const { t } = useTranslation();
  const [localstorage, setLocalStorage] = useState(null);

  const [logoutUser] = useMutation(LOGOUT_USER);

  useEffect(() => {
    const customerDetail = localStorage.getItem("customerDetail");
    setLocalStorage(customerDetail);
  }, []);

  const handleLogout = async () => {
    const { data } = await logoutUser();
    if (data.logout) {
      localStorage.removeItem("customerDetail");
      window.location.reload();
    } else {
      return;
    }
  };

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
                <LocalLink href={`/page/compare`}>
                  <i className="fa fa-random" aria-hidden="true"></i>
                  {t("top_header.compare")}
                </LocalLink>
              </li>
              <li className="mobile-wishlist">
                <LocalLink href={`/page/account/wishlist`}>
                  <i className="fa fa-heart" aria-hidden="true"></i>
                  {t("top_header.wishlist")}
                </LocalLink>
              </li>
              <li className="onhover-dropdown mobile-account">
                <i className="fa fa-user" aria-hidden="true"></i>{" "}
                {t("top_header.my_account")}
                <ul className="onhover-show-div">
                  {!localstorage ? (
                    <>
                      <li>
                        <LocalLink href={`/page/account/login`}>
                          {t("top_header.login")}
                        </LocalLink>
                      </li>
                      <li>
                        <LocalLink href={`/page/account/register`}>
                          {t("top_header.register")}
                        </LocalLink>
                      </li>
                    </>
                  ) : (
                    <li>
                      <LocalLink onClick={handleLogout}>
                        {t("logout")}
                      </LocalLink>
                    </li>
                  )}
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
