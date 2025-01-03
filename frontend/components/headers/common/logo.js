import React, { Fragment } from "react";
import LocaleLink from "../../LocaleLink";

const LogoImage = ({ logo }) => {
  return (
    <Fragment>
      <LocaleLink href={"/"}>
        {/* <a> */}
        <img
          src={`/assets/images/icon/${logo ? logo : "logo.png"}`}
          alt=""
          className="img-fluid"
        />
        {/* </a> */}
      </LocaleLink>
    </Fragment>
  );
};

export default LogoImage;
