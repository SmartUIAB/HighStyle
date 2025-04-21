import React, { useContext } from "react";
import CommonLayout from "../../../components/shop/common-layout";
import { Container, Row, Table, Media, Col } from "reactstrap";
import { CompareContext } from "../../../helpers/Compare/CompareContext";
import { useTranslation } from "react-i18next";
import { CREATE_ADD_TO_CART } from "../../../GraphQL/Mutations/cartMutations";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";

const Compare = () => {
  const contextCompare = useContext(CompareContext);
  const compareItem = contextCompare.compareItems;
  const { t } = useTranslation();

  const [createcart] = useMutation(CREATE_ADD_TO_CART);

  const handleAddToCart = async (product) => {
    const customerDetail = JSON.parse(localStorage.getItem("customerDetail"));
    if (!customerDetail || customerDetail === "null") {
      router.replace("/page/account/login");
      return;
    }
    const { data } = await createcart({
      variables: {
        input: {
          userId: customerDetail?.id,
          products: {
            ProductID: product.id,
            price: product.price,
            quantity: 1,
            color: product.colors[0] || null,
            size: product.sizes[0] || null,
            totalAmount: product.price,
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

  return (
    <CommonLayout parent={t("compare.home")} title={t("compare.title")}>
      <section className="compare-padding">
        <Container>
          <Row>
            <Col sm="12">
              {compareItem.length >= 0 ? (
                <div className="compare-page">
                  <div className="table-wrapper table-responsive">
                    <Table className="table">
                      <thead>
                        <tr className="th-compare">
                          <td>{t("compare.action")}</td>
                          {compareItem.map((item, i) => (
                            <th className="item-row" key={i}>
                              <button
                                type="button"
                                className="remove-compare"
                                onClick={() =>
                                  contextCompare.removeFromComapre(item)
                                }
                              >
                                {t("compare.remove")}
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody id="table-compare">
                        <tr>
                          <th className="product-name">
                            {t("compare.product_name")}
                          </th>
                          {compareItem.map((item, i) => (
                            <td className="grid-link__title" key={i}>
                              {item.title}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th className="product-name">
                            {t("compare.product_image")}
                          </th>
                          {compareItem.map((item, i) => (
                            <td className="item-row" key={i}>
                              <img
                                src={
                                  process.env.NEXT_PUBLIC_API_KEY +
                                  item.images[0]
                                }
                                alt=""
                                className="featured-image"
                              />
                              <div className="product-price product_price">
                                <strong> {t("compare.on_sale")}:</strong>
                                <span>{item.price}</span>
                              </div>
                              <form className="variants clearfix">
                                <input type="hidden" />
                                <button
                                  type="button"
                                  title="Add to Cart"
                                  className="add-to-cart btn btn-solid"
                                  onClick={() => handleAddToCart(item)}
                                >
                                  {t("compare.add_to_cart")}
                                </button>
                              </form>
                              <p className="grid-link__title hidden">
                                {item.title}
                              </p>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th className="product-name">
                            {t("compare.product_description")}
                          </th>
                          {compareItem.map((item, i) => (
                            <td className="item-row" key={i}>
                              <p className="description-compare">
                                {item.description}
                              </p>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <th className="product-name">
                            {t("compare.availability")}
                          </th>
                          {compareItem.map((item, i) => (
                            <td className="available-stock" key={i}>
                              <p>
                                {item.stock >= 0
                                  ? t("compare.not_available")
                                  : t("compare.available")}
                              </p>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
              ) : (
                <section className="cart-section section-b-space">
                  <Container>
                    <Row>
                      <Col sm="12">
                        <div>
                          <Col sm="12" className="empty-cart-cls text-center">
                            <Media
                              src={`/assets/images/icon-empty-cart.png`}
                              className="img-fluid mb-4 mx-auto"
                              alt=""
                            />
                            <h3>
                              <strong>{t("compare.empty.title")}</strong>
                            </h3>
                            <h4>{t("compare.empty.message")}.</h4>
                          </Col>
                        </div>
                      </Col>
                    </Row>
                  </Container>
                </section>
              )}
            </Col>
          </Row>
        </Container>
      </section>
    </CommonLayout>
  );
};

export default Compare;
