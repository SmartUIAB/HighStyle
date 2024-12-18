import { Href, ImagePath } from "@/Constants";
import { useAppDispatch, useAppSelector } from "@/Redux/Hooks";
import { setOpenCloseSidebar, setRightSidebar } from "@/Redux/LayoutReducer";
import { setLanguage } from "@/Redux/LanguageReducer";
import { useTranslation } from "@/app/i18n/client";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { AlignLeft, Bell, Maximize2, MessageSquare, MoreHorizontal } from "react-feather";
import { Badge, Col, Row } from "reactstrap";
import Language from "./Language";
import Notification from "./Notification";
import SearchHeader from "./SearchHeader";
import UserMenu from "./UserMenu";

const Header = () => {
  const { sidebar, rightSidebar } = useAppSelector((store) => store.LayoutReducer);
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation(i18LangStatus);
  const pathname = usePathname();
  const router = useRouter();

  const [fullScreen, setFullScreen] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [navMenus, setNavMenus] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  useEffect(() => {
    const langFromURL = pathname.split("/")[1] || "en";
    setCurrentLanguage(langFromURL);
    dispatch(setLanguage(langFromURL));
    i18n.changeLanguage(langFromURL);
  }, [pathname, dispatch, i18n]);

  const goFull = (isFullScreen: boolean) => {
    setFullScreen(isFullScreen);
    if (isFullScreen) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);

    const languageCodeRegex = /^\/[a-z]{2}(\/|$)/;
    const updatedPath = pathname.replace(languageCodeRegex, `/${lang}$1`);
    router.push(updatedPath);
  };

  const toggle = () => {
    setNavMenus(!navMenus);
  };

  return (
    <Fragment>
      <div className={`page-main-header ${sidebar && "open"}`}>
        <Row className="main-header-right">
          <div className="main-header-left d-lg-none col-auto">
            <div className="logo-wrapper">
              <a href={Href}>
                <img
                  className="blur-up lazyloaded"
                  src={`${ImagePath}/dashboard/multikart-logo-black.png`}
                  alt=""
                />
              </a>
            </div>
          </div>
          <div className="mobile-sidebar col-auto p-0">
            <div className="media-body text-end switch-sm">
              <label className="switch">
                <a
                  href={Href}
                  onClick={() => {
                    dispatch(setOpenCloseSidebar(toggleSidebar));
                    setToggleSidebar(!toggleSidebar);
                  }}
                >
                  <AlignLeft />
                </a>
              </label>
            </div>
          </div>
          <Col au className="nav-right ">
            <ul className={"nav-menus " + (navMenus ? "open" : "")}>
              <li>
                <SearchHeader />
              </li>
              <li>
                <a onClick={() => goFull(!fullScreen)} className="text-dark" href={Href}>
                  <Maximize2 />
                </a>
              </li>
              <li className="onhover-dropdown">
                <a className="txt-dark" href={Href}>
                  <h6>{currentLanguage.toUpperCase()}</h6>
                </a>
                <Language onLanguageChange={handleLanguageChange} />
              </li>
              <li className="onhover-dropdown">
                <Bell />
                <Badge
                  color="primary"
                  pill
                  className=" rounded-pill badge-primary pull-right notification-badge"
                >
                  3
                </Badge>
                <span className="dot"></span>
                <Notification />
              </li>
              <li>
                <a href={Href} onClick={() => dispatch(setRightSidebar(!rightSidebar))}>
                  <MessageSquare />
                  <span className="dot"></span>
                </a>
              </li>
              <UserMenu />
            </ul>
            <div className="d-lg-none mobile-toggle pull-right" onClick={toggle}>
              <MoreHorizontal />
            </div>
          </Col>
        </Row>
      </div>
    </Fragment>
  );
};

export default Header;
