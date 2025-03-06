import React, { Fragment } from "react";
import Slider from "react-slick";
import Link from "next/link";
import { Container, Row, Col } from "reactstrap";
import MasterBanner from "./MasterBanner";
import { useTranslation } from "react-i18next";

const Data = [
  {
    img: "home1",
    title: "landing_page.welcome",
    desc: "landing_page.men_fashion",
    link: "/left-sidebar/collection ",
  },
  {
    img: "home2",
    title: "landing_page.welcome",
    desc: "landing_page.women_fashion",
    link: "/left-sidebar/collection ",
  },
];

const Banner = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <section className="p-0">
        <Slider className="slide-1 home-slider">
          {Data.map((data, i) => {
            return (
              <MasterBanner
                key={i}
                img={data.img}
                desc={t(data.desc)}
                title={t(data.title)}
                link={data.link}
              />
            );
          })}
        </Slider>
      </section>
    </Fragment>
  );
};

export default Banner;
