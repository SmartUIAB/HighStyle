import React, { useContext } from "react";
import { Container, Row, Col, Table } from "reactstrap";
import { WishlistContext } from "../../../../../helpers/wishlist/WishlistContext";
import { useRouter } from "next/router";
import LocalLink from "../../../../../components/LocalLink";
import { toast } from "react-toastify";
import { CREATE_ADD_TO_CART } from "../../../../../GraphQL/Mutations/cartMutations";
import { useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";

const WishlistPage = () => {
  const router = useRouter();
  const context = useContext(WishlistContext);

  const wishlist = context.wishlistItems;
  const removeFromWish = context.removeFromWish;
  const { t } = useTranslation();

  const [createcart] = useMutation(CREATE_ADD_TO_CART);

  const handleAddToCart = async (product) => {
    const userData = JSON.parse(localStorage.getItem("customerDetail"));
    const { data } = await createcart({
      variables: {
        input: {
          userId: userData?.id,
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
    <>
      {wishlist.length >= 0 ? (
        <section className="wishlist-section section-b-space">
          <Container>
            <Row>
              <Col sm="12">
                <Table className="table cart-table table-responsive-xs">
                  <thead>
                    <tr className="table-head">
                      <th scope="col">{t("wishlist.image")}</th>
                      <th scope="col">{t("wishlist.product_name")}</th>
                      <th scope="col">{t("wishlist.price")}</th>
                      <th scope="col">{t("wishlist.availability")}</th>
                      <th scope="col">{t("wishlist.action")}</th>
                    </tr>
                  </thead>
                  {wishlist.map((item, i) => (
                    <tbody key={i}>
                      <tr>
                        <td>
                          <a href="#">
                            <img
                              src={
                                process.env.NEXT_PUBLIC_API_KEY + item.images[0]
                              }
                              alt=""
                            />
                          </a>
                        </td>
                        <td>
                          <a href="#">{item.title}</a>
                          <Row className="mobile-cart-content">
                            <div className="col-xs-3">
                              <p>{item.status}</p>
                            </div>
                            <div className="col-xs-3">
                              <h2 className="td-color">${item.price}</h2>
                            </div>
                            <div className="col-xs-3">
                              <h2 className="td-color">
                                <a href="#" className="icon me-1">
                                  <i className="fa fa-close"></i>
                                </a>
                                <a href="#" className="cart">
                                  <i className="fa fa-shopping-cart"></i>
                                </a>
                              </h2>
                            </div>
                          </Row>
                        </td>
                        <td>
                          <h2>${item.price}</h2>
                        </td>
                        <td>
                          <p>{item.status}</p>
                        </td>
                        <td>
                          <a
                            href={null}
                            className="icon me-3"
                            onClick={() => removeFromWish(item)}
                          >
                            <i className="fa fa-times"></i>
                          </a>
                          <a
                            href={null}
                            className="cart"
                            onClick={() => handleAddToCart(item)}
                          >
                            <i className="fa fa-shopping-cart"></i>
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  ))}
                </Table>
              </Col>
            </Row>
            <Row className="wishlist-buttons">
              <Col sm="12">
                <LocalLink href={"/"} className="btn btn-solid">
                  {t("wishlist.continue_shopping")}
                </LocalLink>
                <a
                  href={null}
                  className="btn btn-solid"
                  onClick={() => handleAddToCart(item)}
                >
                  {t("wishlist.check_out")}
                </a>
              </Col>
            </Row>
          </Container>
        </section>
      ) : (
        ""
      )}
    </>
  );
};

export default WishlistPage;
