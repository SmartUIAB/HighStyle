import React, { useState, useEffect } from "react";
import ProductTab from "../common/product-tab";
import Service from "../common/service";
import NewProduct from "../../shop/common/newProduct";
import Slider from "react-slick";
import { useQuery } from "@apollo/client";
import ReactImageMagnify from "react-image-magnify";
import DetailsWithPrice from "../common/detail-price";
import Filter from "../common/filter";
import { Container, Row, Col, Media } from "reactstrap";
import { useRouter } from "next/router";
import {
  DIGITAL_PRODUCT_BY_ID,
  PHYSICAL_PRODUCT_BY_ID,
} from "../../../../GraphQL/Queries/productQueries";

const LeftSidebarPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { loading, data: physicalProductData } = useQuery(
    PHYSICAL_PRODUCT_BY_ID,
    {
      variables: { physicalProductId: id?.toString() || "" },
      skip: !id,
    }
  );

  const { data: digitalProductData } = useQuery(DIGITAL_PRODUCT_BY_ID, {
    variables: { digitalProductId: id?.toString() || "" },
    skip: !id,
  });

  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);

  const [slider1, setSlider1] = useState(null);
  const [slider2, setSlider2] = useState(null);

  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    if (slider1 && slider2) {
      setNav1(slider1);
      setNav2(slider2);
    }
  }, [slider1, slider2]);

  useEffect(() => {
    if (images.length > 0) {
      setCurrentImage(`${process.env.NEXT_PUBLIC_API_KEY}${images[0]}`);
    }
  }, [physicalProductData, digitalProductData]);

  const filterClick = () => {
    const filterElement = document.getElementById("filter");
    if (filterElement) filterElement.style.left = "-15px";
  };

  const changeColorVar = (img_id) => {
    if (slider2) {
      slider2.slickGoTo(img_id);
      setCurrentImage(`${process.env.NEXT_PUBLIC_API_KEY}${images[img_id]}`);
    }
  };

  const productSliderSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    arrows: true,
    fade: true,
    asNavFor: nav2,
    afterChange: (index) => {
      setCurrentImage(`${process.env.NEXT_PUBLIC_API_KEY}${images[index]}`);
    },
  };

  const sliderNavSettings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    adaptiveHeight: true,
    focusOnSelect: true,
  };

  const images =
    physicalProductData?.physicalProduct?.images ||
    digitalProductData?.digitalProduct?.images ||
    [];

  return (
    <section className="left-sidebar-page">
      <div className="collection-wrapper">
        <Container>
          <Row>
            <Col sm="3" className="collection-filter" id="filter">
              <Filter />
              <Service />
              <NewProduct />
            </Col>
            <Col lg="9" sm="12" xs="12">
              <Container fluid>
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

                {loading ? (
                  "Loading..."
                ) : (
                  <Row>
                    <Col lg="6" className="product-thumbnail">
                      <ReactImageMagnify
                        {...{
                          smallImage: {
                            alt: "Product Zoom Image",
                            isFluidWidth: true,
                            src: currentImage,
                          },
                          largeImage: {
                            src: currentImage,
                            width: 1200,
                            height: 1200,
                          },
                          enlargedImageContainerStyle: { zIndex: 9 },
                        }}
                      />

                      <Slider
                        {...sliderNavSettings}
                        ref={(slider) => setSlider2(slider)}
                        className="slider-nav"
                        asNavFor={nav1}
                      >
                        {images.map((image, index) => (
                          <div
                            key={index}
                            onClick={() => changeColorVar(index)}
                          >
                            <Media
                              src={`${process.env.NEXT_PUBLIC_API_KEY}${image}`}
                              alt={`Thumbnail ${index}`}
                              className="img-fluid"
                            />
                          </div>
                        ))}
                      </Slider>
                    </Col>

                    <Col lg="6" className="rtl-text product-ps">
                      <DetailsWithPrice
                        item={
                          physicalProductData?.physicalProduct ||
                          digitalProductData?.digitalProduct
                        }
                        changeColorVar={changeColorVar}
                      />
                    </Col>
                  </Row>
                )}
              </Container>
              <ProductTab
                item={
                  physicalProductData?.physicalProduct ||
                  digitalProductData?.digitalProduct
                }
              />
            </Col>
          </Row>
        </Container>
      </div>
    </section>
  );
};

export default LeftSidebarPage;
