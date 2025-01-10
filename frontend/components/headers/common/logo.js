import React, { Fragment } from "react";
import LocalLink from "../../LocalLink";

const LogoImage = ({ logo }) => {
  return (
    <Fragment>
      <LocalLink href={"/"}>
        {/* <a> */}
        <img
          src={`/assets/images/icon/${logo ? logo : "logo.png"}`}
          alt=""
          className="img-fluid"
        />
        {/* </a> */}
      </LocalLink>
    </Fragment>
  );
};

export default LogoImage;
