import Link from "next/link";
import { Col, Container, Row } from "reactstrap";
import LocaleLink from "../../../../../components/LocaleLink";

const MasterBanner = ({ img, title, desc, link, classes, btn, btnClass }) => {
  return (
    <div>
      <div className={`home ${img} ${classes ? classes : "text-center"}`}>
        <Container>
          <Row>
            <Col>
              <div className="slider-contain">
                <div>
                  <h4>{title}</h4>
                  <h1>{desc}</h1>
                  <LocaleLink
                    href={link}
                    className={`btn ${btnClass ? btnClass : "btn-solid"}`}
                  >
                    {/* <a > */}
                    {btn ? btn : "Shop Now"} {/* </a> */}
                  </LocaleLink>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default MasterBanner;
