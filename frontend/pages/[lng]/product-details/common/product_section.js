import React, { useContext, useState } from "react";
import { Container, Row, Col, Media, Modal, ModalBody } from "reactstrap";
import { useMutation, useQuery } from "@apollo/client";
import { CompareContext } from "../../../../helpers/Compare/CompareContext";
import { useRouter } from "next/router";
import {
  GET_DIGITAL_PRODUCT,
  GET_PHYSICAL_PRODUCT,
} from "../../../../GraphQL/Queries/productQueries";
import { useTranslation } from "react-i18next";
import { CREATE_ADD_TO_CART } from "../../../../GraphQL/Mutations/cartMutations";
import LocalLink from "../../../../components/LocalLink";
import { toast } from "react-toastify";
import { ADD_TO_FAVOURITE } from "../../../../GraphQL/Mutations/favouriteMutations";

const ProductSection = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const compareContext = useContext(CompareContext);
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState();
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const uniqueTags = [];
  const { id } = router.query;

  const [createcart] = useMutation(CREATE_ADD_TO_CART);
  const [addtofavourite] = useMutation(ADD_TO_FAVOURITE);
  const userData = JSON.parse(localStorage.getItem("customerDetail"));

  const handleAddToCart = async (product) => {
    const { data } = await createcart({
      variables: {
        input: {
          userId: userData?.id,
          products: {
            ProductID: product.id,
            price: product.price,
            quantity: quantity,
            color: product.colors[0] || null,
            size: product.sizes[0] || null,
            totalAmount: product.price * quantity,
            title: product.title,
          },
        },
      },
    });
    if (data) {
      toast.success(t("product_details.addToCart"));
    } else {
      toast.error(t("product_details.addToCartError"));
    }
  };

  const getSelectedProduct = (item) => {
    setSelectedProduct(item);
    toggle();
  };

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

  const relatedProduct = mergedProducts.filter((item) => item.id !== id);

  const handleChange = (event) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (
      !isNaN(newQuantity) &&
      newQuantity > 0 &&
      newQuantity <= stockQuantity
    ) {
      setQuantity(newQuantity);
    }
  };

  const product = selectedProduct;
  const isDigital = product?.__typename === "DigitalProduct";
  const stockQuantity = isDigital ? Infinity : product?.stockQuantity || 0;

  const IncrementItem = () => {
    if (quantity < stockQuantity) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    }
  };

  const DecreaseItem = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleAddFavourite = async (product) => {
    try {
      const { data } = await addtofavourite({
        variables: {
          userId: userData?.id,
          productId: product.id,
          productType: product.__typename,
        },
      });

      if (data) {
        toast.success("Add to Favourite Successfully");
      } else {
        toast.error("Failed to Remove Favourite Product");
      }
    } catch (error) {
      toast.error("An error occurred while adding the product from favourites");
    }
  };

  return (
    <section className="section-b-space ratio_asos">
      <Container>
        <Row>
          <Col className="product-related">
            <h2>{t("product_details.relatedProduct")}</h2>
          </Col>
        </Row>
        <Row className="search-product">
          {!relatedProduct || loading ? (
            "loading"
          ) : (
            <>
              {relatedProduct.slice(0, 6).map((product, index) => (
                <Col xl="2" md="4" sm="6" key={index}>
                  <div className="product-box">
                    <div className="img-wrapper">
                      <div className="front">
                        <LocalLink href={`/product-details/${product.id}`}>
                          <Media
                            onClick={() => clickProductDetail(product)}
                            src={
                              process.env.NEXT_PUBLIC_API_KEY +
                              product.images[0]
                            }
                            className="img-fluid blur-up lazyload bg-img"
                            alt=""
                          />
                        </LocalLink>
                      </div>
                      <div className="back">
                        <LocalLink href={`/product-details/${product.id}`}>
                          <Media
                            src={
                              process.env.NEXT_PUBLIC_API_KEY +
                              product.images[0]
                            }
                            className="img-fluid blur-up lazyload bg-img"
                            alt=""
                          />
                        </LocalLink>
                      </div>
                      <div className="cart-info cart-wrap">
                        <button
                          data-toggle="modal"
                          data-target="#addtocart"
                          title="Add to cart"
                          onClick={() => handleAddToCart(product)}
                        >
                          <i className="fa fa-shopping-cart"></i>
                        </button>
                        <a
                          href="#"
                          onClick={() => handleAddFavourite(product)}
                          title="Add to Wishlist"
                        >
                          <i className="fa fa-heart" aria-hidden="true"></i>
                        </a>
                        <a
                          href="#"
                          onClick={() => getSelectedProduct(product)}
                          data-toggle="modal"
                          data-target="#quick-view"
                          title="Quick View"
                        >
                          <i className="fa fa-search" aria-hidden="true"></i>
                        </a>
                        <a
                          href="#"
                          onClick={() => compareContext.addToCompare(product)}
                          title="Compare"
                        >
                          <i className="fa fa-refresh" aria-hidden="true"></i>
                        </a>
                      </div>
                    </div>
                    <div className="product-detail">
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
                      <h4>{product.price.toFixed(2)}</h4>
                      {product.__typename === "PhysicalProduct" && (
                        <ul className="color-variant">
                          {product.colors.map((color, index) => (
                            <li
                              key={index}
                              style={{ backgroundColor: color }}
                              className={`color-item ${index}`}
                            ></li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Col>
              ))}
            </>
          )}
        </Row>
        {selectedProduct ? (
          <Modal
            isOpen={modal}
            toggle={toggle}
            className="modal-lg quickview-modal"
            centered
          >
            <ModalBody>
              <Row>
                <Col lg="6" xs="12">
                  <div className="quick-view-img">
                    <Media
                      src={
                        process.env.NEXT_PUBLIC_API_KEY +
                        selectedProduct.images[0]
                      }
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                </Col>
                <Col lg="6" className="rtl-text">
                  <div className="product-right">
                    <h2> {selectedProduct.title} </h2>
                    <h3>{selectedProduct.price.toFixed(2)}</h3>
                    {selectedProduct.variants ? (
                      <ul className="color-variant">
                        {uniqueTags ? (
                          <ul className="color-variant">
                            {selectedProduct.type === "jewellery" ||
                            selectedProduct.type === "nursery" ||
                            selectedProduct.type === "beauty" ||
                            selectedProduct.type === "electronics" ||
                            selectedProduct.type === "goggles" ||
                            selectedProduct.type === "watch" ||
                            selectedProduct.type === "pets" ? (
                              ""
                            ) : (
                              <>
                                {uniqueTags ? (
                                  <ul className="color-variant">
                                    {uniqueTags.map((vari, i) => {
                                      return (
                                        <li
                                          className={vari.color}
                                          key={i}
                                          title={vari.color}
                                          onClick={() =>
                                            variantChangeByColor(
                                              vari.image_id,
                                              selectedProduct.images
                                            )
                                          }
                                        ></li>
                                      );
                                    })}
                                  </ul>
                                ) : (
                                  ""
                                )}
                              </>
                            )}
                          </ul>
                        ) : (
                          ""
                        )}
                      </ul>
                    ) : (
                      ""
                    )}
                    <div className="border-product">
                      <h6 className="product-title">
                        {t("quickview.product_details")}
                      </h6>
                      <p>{selectedProduct.description}</p>
                    </div>
                    <div className="product-description border-product">
                      {selectedProduct.size ? (
                        <div className="size-box">
                          <ul>
                            {selectedProduct.size.map((size, i) => {
                              return (
                                <li key={i}>
                                  <a href={null}>{size}</a>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : (
                        ""
                      )}
                      <h6 className="product-title">
                        {t("quickview.quantity")}
                      </h6>
                      <div className="qty-box">
                        <div className="input-group">
                          <span className="input-group-prepend">
                            <button
                              type="button"
                              className="btn quantity-left-minus"
                              onClick={DecreaseItem}
                              disabled={quantity <= 1}
                              data-type="minus"
                              data-field=""
                            >
                              <i className="fa fa-angle-left"></i>
                            </button>
                          </span>
                          <input
                            type="text"
                            name="quantity"
                            value={quantity}
                            onChange={handleChange}
                            min="1"
                            max={stockQuantity}
                            className="form-control input-number"
                          />
                          <span className="input-group-prepend">
                            <button
                              type="button"
                              className="btn quantity-right-plus"
                              onClick={IncrementItem}
                              disabled={quantity >= stockQuantity}
                              data-type="plus"
                              data-field=""
                            >
                              <i className="fa fa-angle-right"></i>
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="product-buttons">
                      <button
                        className="btn btn-solid"
                        onClick={() => handleAddToCart(selectedProduct)}
                      >
                        {t("quickview.add_to_cart")}
                      </button>
                      <LocalLink
                        href={`/product-details/${selectedProduct.id}`}
                        passHref
                      >
                        <button
                          className="btn btn-solid"
                          onClick={() => setModal(false)}
                        >
                          {t("quickview.view_detail")}
                        </button>
                      </LocalLink>
                    </div>
                  </div>
                </Col>
              </Row>
            </ModalBody>
          </Modal>
        ) : (
          ""
        )}
      </Container>
    </section>
  );
};

export default ProductSection;
