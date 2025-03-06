import React from "react";
import { Container, Row, Col } from "reactstrap";
import {
  svgDiamond,
  svgFastEfficient,
  svgFreeShipping,
  svgpayment,
  svgservice,
} from "../../../services/script";
import MasterServiceContent from "./MasterServiceConternt";

const Data = [
  {
    link: svgFreeShipping,
    title: "GRATIS FRAKT",
    service: "Vid beställningar över 500 SEK",
  },
  {
    link: svgpayment,
    title: "Online betalning",
    service: "Betala säkert online",
  },
  {
    link: svgservice,
    title: "24 X 7 service",
    service: "Vår kundtjänst är tillgänglig 24x7",
  },
  {
    link: svgFastEfficient,
    title: "Snabbt & effektivt",
    service: "Våra tjänster är snabbt och effektivt.",
  },
  
];

const Service = () => {
  return (
    <Container>
      <section className="service small-section pb-0">
        <Row className="partition4">
          {Data.map((data, index) => {
            return (
              <Col
                lg="3"
                xs="6"
                className={`service-block1`}
                key={index}
              >
                <MasterServiceContent
                  title={data.title}
                  link={data.link}
                  service={data.service}
                  marijuana={true}
                />
              </Col>
            );
          })}
        </Row>
      </section>
    </Container>
  );
};
export default Service;