import React from "react";
import { Container, Row, Col, Table, Spinner } from "reactstrap";
import LocalLink from "../../../../../components/LocalLink";
import { toast } from "react-toastify";
import { CREATE_ADD_TO_CART } from "../../../../../GraphQL/Mutations/cartMutations";
import { useMutation, useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { GET_FAVOURITE_PRODUCT } from "../../../../../GraphQL/Queries/favouriteQueries";
import { REMOVE_FAVOURITE } from "../../../../../GraphQL/Mutations/favouriteMutations";

const WishlistPage = () => {
  const { t } = useTranslation();

  const [createcart] = useMutation(CREATE_ADD_TO_CART);
  const [removeFavourite] = useMutation(REMOVE_FAVOURITE);
  const userData = JSON.parse(localStorage.getItem("customerDetail"));

  const {
    data: favouriteData,
    loading,
    refetch,
  } = useQuery(GET_FAVOURITE_PRODUCT, {
    variables: {
      userId: userData?.id,
    },
  });

  const handleAddToCart = async (product) => {
    try {
      const { data } = await createcart({
        variables: {
          input: {
            userId: userData?.id,
            products: {
              ProductID: product?.productId._id,
              price: product?.productId.price,
              quantity: 1,
              color: product?.productId.colors[0] || null,
              size: product?.productId.sizes[0] || null,
              totalAmount: product?.productId.price,
              title: product?.productId.title,
            },
          },
        },
      });
      if (data) {
        toast.success(t("product_details.addToCart"));
        refetch();
      } else {
        toast.error(t("product_details.addToCartError"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("product_details.addToCartError"));
    }
  };

  const handleRemoveFromFavourite = async (product) => {
    try {
      const { data } = await removeFavourite({
        variables: {
          userId: product.userId,
          productId: product.productId._id,
          productType: product.productType,
        },
      });

      if (data) {
        toast.success(t("wishlist.removeFromFavourite"));
        refetch();
      } else {
        toast.error("Failed to Remove Favourite Product");
      }
    } catch (error) {
      toast.error(
        "An error occurred while removing the product from favourites"
      );
    }
  };

  if (loading) {
    return <Spinner style={{ color: "#ff8084" }} />;
  }

  return (
    <>
      {favouriteData?.getFavourites.length > 0 ? (
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
                  {favouriteData?.getFavourites.map((item, i) => (
                    <tbody key={i}>
                      <tr>
                        <td>
                          <a href="#">
                            <img
                              src={
                                process.env.NEXT_PUBLIC_API_KEY +
                                item.productId.images[0]
                              }
                              alt="product"
                            />
                          </a>
                        </td>
                        <td>
                          <a href="#">{item.productId.title}</a>
                          <Row className="mobile-cart-content">
                            <div className="col-xs-3">
                              <p>{item.productId.status}</p>
                            </div>
                            <div className="col-xs-3">
                              <h2 className="td-color">
                                ${item.productId.price}
                              </h2>
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
                          <h2>${item.productId.price}</h2>
                        </td>
                        <td>
                          <p>{item.productId.status}</p>
                        </td>
                        <td>
                          <a
                            href={null}
                            className="icon me-3"
                            onClick={() => handleRemoveFromFavourite(item)}
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
              </Col>
            </Row>
          </Container>
        </section>
      ) : (
        <p>{t("wishlist.notAvailableFavouriteProduct")}</p>
      )}
    </>
  );
};

export default WishlistPage;
