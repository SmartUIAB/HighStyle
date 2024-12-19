import React, { useState, useEffect } from "react";
import ProductTab from "../common/product-tab";
import Service from "../common/service";
import NewProduct from "../../shop/common/newProduct";
import Slider from "react-slick";
import { useQuery } from "@apollo/client";
import ImageZoom from "../common/image-zoom";
import DetailsWithPrice from "../common/detail-price";
import Filter from "../common/filter";
import { Container, Row, Col, Media } from "reactstrap";
import { useRouter } from "next/router";
import { PHYSICAL_PRODUCT_BY_ID } from "../../../GraphQL/Queries/productQueries";

const LeftSidebarPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { loading, data } = useQuery(PHYSICAL_PRODUCT_BY_ID, {
    variables: {
      physicalProductId: id?.toString() || "",
    },
  });

  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);

  const [slider1, setSlider1] = useState(null);
  const [slider2, setSlider2] = useState(null);

  // Ensure nav1 and nav2 are set properly when slider1 and slider2 are initialized
  useEffect(() => {
    if (slider1 && slider2) {
      setNav1(slider1);
      setNav2(slider2);
    }
  }, [slider1, slider2]);

  const filterClick = () => {
    document.getElementById("filter").style.left = "-15px";
  };

  const changeColorVar = (img_id) => {
    if (slider2) {
      slider2.slickGoTo(img_id);
    }
  };

  // Slider settings
  const productSliderSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    arrows: true,
    fade: true,
    asNavFor: nav2, // Sync with the navigation slider
  };

  const sliderNavSettings = {
    slidesToShow: data?.physicalProduct?.images?.length || 3, // Default to 3 if images are not loaded yet
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    adaptiveHeight: true,
    focusOnSelect: true,
  };

  return (
    <section className="">
      <div className="collection-wrapper">
        <Container>
          <Row>
            <Col sm="3" className="collection-filter" id="filter">
              <Filter />
              <Service />
              {/* Side-bar single product slider */}
              <NewProduct />
            </Col>
            <Col lg="9" sm="12" xs="12">
              <Container fluid={true}>
                <Row>
                  <Col xl="12" className="filter-col">
                    <div className="filter-main-btn mb-2">
                      <span onClick={filterClick} className="filter-btn">
                        <i className="fa fa-filter" aria-hidden="true"></i>{" "}
                        Filter
                      </span>
                    </div>
                  </Col>
                </Row>

                {!data?.physicalProduct || loading ? (
                  "Loading..."
                ) : (
                  <Row>
                    <Col lg="6" className="product-thumbnail">
                      <Slider
                        {...productSliderSettings}
                        ref={(slider) => setSlider1(slider)}
                        className="product-slick"
                      >
                        {data?.physicalProduct?.images?.map((image, index) => (
                          <div key={index}>
                            <ImageZoom
                              image={process.env.NEXT_PUBLIC_API_KEY + image}
                            />
                          </div>
                        ))}
                      </Slider>

                      {/* Navigation slider for thumbnails */}
                      <Slider
                        {...sliderNavSettings}
                        ref={(slider) => setSlider2(slider)}
                        className="slider-nav"
                        asNavFor={nav1}
                      >
                        {data?.physicalProduct?.images?.map((image, index) => (
                          <div key={index}>
                            <Media
                              src={process.env.NEXT_PUBLIC_API_KEY + image}
                              alt={`Thumbnail ${index}`}
                              className="img-fluid"
                            />
                          </div>
                        ))}
                      </Slider>
                    </Col>

                    <Col lg="6" className="rtl-text product-ps">
                      <DetailsWithPrice
                        item={data?.physicalProduct}
                        changeColorVar={changeColorVar}
                      />
                    </Col>
                  </Row>
                )}
              </Container>
              <ProductTab />
            </Col>
          </Row>
        </Container>
      </div>
    </section>
  );
};

export default LeftSidebarPage;
