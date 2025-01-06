import React from "react";
import { useQuery } from "@apollo/client";
import { Media, Spinner } from "reactstrap";
import Slider from "react-slick";
import {
  GET_DIGITAL_PRODUCT,
  GET_PHYSICAL_PRODUCT,
} from "../../../../GraphQL/Queries/productQueries";
import { useTranslation } from "react-i18next";

const NewProduct = () => {
  const { t } = useTranslation();
  const {
    data: allPhysicalProductData,
    loading: loadingPhysical,
    error: errorPhysical,
  } = useQuery(GET_PHYSICAL_PRODUCT);
  const {
    data: allDigitalProductData,
    loading: loadingDigital,
    error: errorDigital,
  } = useQuery(GET_DIGITAL_PRODUCT);

  const mergedProducts = [
    ...(allPhysicalProductData?.physicalProducts?.products || []),
    ...(allDigitalProductData?.digitalProducts?.products || []),
  ];

  const loading = loadingPhysical || loadingDigital;

  return (
    <div className="theme-card">
      <h5 className="title-border">{t("product_details.newProduct")}</h5>
      <Slider className="offer-slider slide-1">
        <div>
          {!mergedProducts || loading ? (
            <Spinner style={{ color: "#ff8084" }} />
          ) : (
            <>
              {mergedProducts &&
                mergedProducts.slice(0, 3).map((product, index) => (
                  <div className="media" key={index}>
                    <a href={`/product-details/${product.id}`}>
                      <Media
                        src={
                          process.env.NEXT_PUBLIC_API_KEY + product.images[0]
                        }
                        alt={`Thumbnail ${index}`}
                        className="img-fluid blur-up lazyload"
                      />
                    </a>
                    <div className="media-body align-self-center">
                      <div className="rating">
                        <i className="fa fa-star"></i>{" "}
                        <i className="fa fa-star"></i>{" "}
                        <i className="fa fa-star"></i>{" "}
                        <i className="fa fa-star"></i>{" "}
                        <i className="fa fa-star"></i>
                      </div>
                      <a href={null}>
                        <h6>{product.title}</h6>
                      </a>
                      <h4>{product.price}</h4>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </Slider>
    </div>
  );
};

export default NewProduct;
