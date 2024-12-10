//@ts-nocheck
import { useEffect, useState } from "react";
import Slider from "react-slick";
import { Col, Spinner } from "reactstrap";

const ProductDetailSlider = ({ data }) => {
  const [nav, setNav] = useState({
    nav1: null,
    nav2: null,
  });

  const apiUrl = 'http://localhost:2024';

  useEffect(() => {
    setNav({
      nav1: Slider.slider1,
      nav2: Slider.slider2,
    });
  }, []);

  if (!data || data.length === 0) {
    return (
      <Col xl="4">
        <div className="text-center">
          <Spinner color="primary" />
        </div>
      </Col>
    );
  }

  const settings = {
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    fade: true,
    pauseOnHover: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <Col xl="4">
      <Slider {...settings} asNavFor={nav.nav2} ref={(slider) => (Slider.slider1 = slider)} className="product-slider no-arrow">
        {data?.map((imageUrl, index) => (
          <div key={index} className="item">
            <img className="img-fluid" src={`${apiUrl}${imageUrl}`} alt={`product-image-${index}`} />
          </div>
        ))}
      </Slider>

      <Slider
        asNavFor={nav.nav1}
        ref={(slider) => (Slider.slider2 = slider)}
        slidesToShow={4}
        swipeToSlide={true}
        focusOnSelect={true}
        className="small-slick"
      >
        {data?.map((imageUrl, index) => (
          <div key={index} className="item">
            <img className="img-fluid" src={`${apiUrl}${imageUrl}`} alt={`thumbnail-image-${index}`} />
          </div>
        ))}
      </Slider>
    </Col>
  );
};

export default ProductDetailSlider;
