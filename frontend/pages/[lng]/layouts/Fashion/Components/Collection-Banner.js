import React, { Fragment } from "react";
import { Container, Row, Col, Media } from "reactstrap";
import banner1 from "../../../../../public/assets/images/sub-banner1.jpg";
import banner2 from "../../../../../public/assets/images/sub-banner2.jpg";
import LocalLink from "../../../../../components/LocalLink";
import { useTranslation } from "react-i18next";

const Data = [
  {
    img: banner1,
    about: "landing_page.men",
    offer: "10% off",
    link: "/left-sidebar/collection",
    class: "p-right text-center",
  },
  {
    img: banner2,
    about: "landing_page.women",
    offer: "10% off",
    link: "/left-sidebar/collection",
    class: "p-right text-center",
  },
];

const MasterCollectionBanner = ({ img, about, offer, link, classes }) => {
  const { t } = useTranslation();
  return (
    <Col md="6">
      <LocalLink href={link}>
        <div className={`collection-banner ${classes}`}>
          <Media src={img} className="img-fluid" alt="" />
          <div className="contain-banner">
            <div>
              <h4>{offer}</h4>
              <h2>{about}</h2>
            </div>
          </div>
        </div>
      </LocalLink>
    </Col>
  );
};

const CollectionBanner = () => {
  const { t } = useTranslation();
  return (
    <Fragment>
      <section className="pb-0">
        <Container>
          <Row className="partition2">
            {Data.map((data, i) => {
              return (
                <MasterCollectionBanner
                  key={i}
                  img={data.img.src}
                  about={t(data.about)}
                  link={data.link}
                  offer={t(data.offer)}
                  classes={data.class}
                />
              );
            })}
          </Row>
        </Container>
      </section>
    </Fragment>
  );
};

export default CollectionBanner;
