import React, { useEffect } from "react";
import NavBar from "./common/navbar";
import SideBar from "./common/sidebar";
import TopBar from "./common/topbar-dark";
import cart from "../../public/assets/images/icon/cart.png";
import CartContainer from "../containers/CartContainer";
import LogoImage from "./common/logo";
import { Container, Col, Row, Media, Input } from "reactstrap";
import Currency from "./common/currency";
import settings from "../../public/assets/images/icon/setting.png";
import SearchOverlay from "./common/search-overlay";
import search from "../../public/assets/images/icon/search.png";
import Language from "./Language";

const HeaderFour = ({ logoName, topClass, fluid, hfluid }) => {
  //   const isLoading = false;

  /*=====================
         Pre loader
		 ==========================*/

  useEffect(() => {
    setTimeout(function () {
      document.querySelectorAll(".loader-wrapper").forEach((element) => {
        element.style.display = "none";
      });
    }, 2000);
  }, []);

  const openNav = () => {
    var openmyslide = document.getElementById("mySidenav");
    if (openmyslide) {
      openmyslide.classList.add("open-side");
    }
  };
  const openSearch = () => {
    document.getElementById("search-overlay").style.display = "block";
  };

  return (
    <div>
      <header>
        <div className="mobile-fix-option"></div>
        {/*Top Header Component*/}
        <TopBar fluid={fluid} topClass={topClass} />

        <Container fluid={hfluid}>
          <Row>
            <Col>
              <div className="main-menu">
                <div className="menu-left">
                  <div className="navbar">
                    <a href="#" onClick={openNav}>
                      <div className="bar-style">
                        <i
                          className="fa fa-bars sidebar-bar"
                          aria-hidden="true"
                        ></i>
                      </div>
                    </a>
                    {/*SideBar Navigation Component*/}
                    <SideBar />
                  </div>
                  <div className="brand-logo">
                    <LogoImage logo={logoName} />
                  </div>
                </div>
                <div className="menu-right pull-right">
                  {/*Top Navigation Bar Component*/}
                  <div>
                    <div className="icon-nav">
                      <ul className="menu-right-center">
                        <div>
                          <form className="form_search" role="textbox">
                            {/* eslint-disable-next-line */}
                            <Input
                              id="query search-autocomplete"
                              type="search"
                              placeholder="Hitta det bästa för ditt önskning..."
                              className="nav-search nav-search-field"
                              aria-expanded="true"
                            />
                            <button
                              type="submit"
                              name="nav-submit-button"
                              className="btn-search"
                            >
                              <i className="fa fa-search"></i>
                            </button>
                          </form>
                        </div>

                        {/* <Currency icon={settings.src} /> */}
                        <Language></Language>
                        {/*Header Cart Component */}
                        <CartContainer icon={cart.src} />
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </header>
      <SearchOverlay />
    </div>
  );
};

export default HeaderFour;
