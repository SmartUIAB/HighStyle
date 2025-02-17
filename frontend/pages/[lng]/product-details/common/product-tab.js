import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Spinner,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@apollo/client";
import {
  UPDATE_REVIEW,
  WRITE_REVIEW,
} from "../../../../GraphQL/Mutations/reviewMutations";
import { toast } from "react-toastify";
import { GET_REVIEWS } from "../../../../GraphQL/Queries/reviewQueries";
import { useRouter } from "next/router";

const ProductTab = ({ item }) => {
  const [activeTab, setActiveTab] = useState("1");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const reviewsPerPage = 3;
  const isDigital = item?.__typename === "DigitalProduct";

  const { t } = useTranslation();
  const [add_review] = useMutation(WRITE_REVIEW);
  const [update_review] = useMutation(UPDATE_REVIEW);
  const router = useRouter();

  const userData = JSON.parse(localStorage.getItem("customerDetail"));
  const {
    data: reviewsData,
    loading,
    refetch,
  } = useQuery(GET_REVIEWS, {
    variables: {
      productId: item?.id,
    },
  });

  const totalReviews = reviewsData?.getReviews?.length || 0;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  const averageRating =
    reviewsData?.getReviews?.length > 0
      ? (
          reviewsData.getReviews.reduce(
            (acc, review) => acc + review.rating,
            0
          ) / reviewsData.getReviews.length
        ).toFixed(1)
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customerDetail = JSON.parse(localStorage.getItem("customerDetail"));
    if (!customerDetail || customerDetail === "null") {
      router.replace("/page/account/login");
      return;
    }

    if (rating <= 0 || !comment.trim()) {
      alert("Please provide a rating and a comment.");
      return;
    }

    if (editingReviewId) {
      const { data } = await update_review({
        variables: {
          productId: item?.id,
          userId: customerDetail?.id,
          rating,
          comment,
        },
      });
      if (data) {
        toast.success("Review updated successfully");
        setEditingReviewId(null);
        setRating(0);
        setComment("");
        refetch();
      } else {
        toast.error("Failed to update review");
      }
    } else {
      const hasReviewed = reviewsData?.getReviews?.some(
        (review) => review.userId.id === customerDetail?.id
      );

      if (hasReviewed) {
        toast.error("You have already submitted a review for this product.");
        setRating(0);
        setComment("");
        return;
      }

      const { data } = await add_review({
        variables: {
          productId: item?.id,
          userId: customerDetail?.id,
          rating,
          comment,
        },
      });

      if (data) {
        toast.success("Review added successfully");
        setRating(0);
        setComment("");
        refetch();
      } else {
        toast.error("Failed to add review");
      }
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp, 10));
    return date.toLocaleDateString();
  };

  const currentReviews = reviewsData?.getReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment);
  };

  return (
    <section className="tab-product m-0">
      <Container>
        <Row>
          <Col sm="12" lg="12">
            <Row className="product-page-main m-0">
              <Nav tabs className="nav-material">
                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                  <NavLink
                    className={activeTab === "1" ? "active" : ""}
                    onClick={() => setActiveTab("1")}
                  >
                    {t("product_details.description")}
                  </NavLink>
                </NavItem>
                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                  <NavLink
                    className={activeTab === "2" ? "active" : ""}
                    onClick={() => setActiveTab("2")}
                  >
                    {t("product_details.details")}
                  </NavLink>
                </NavItem>
                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                  <NavLink
                    className={activeTab === "3" ? "active" : ""}
                    onClick={() => setActiveTab("3")}
                  >
                    {t("product_details.video")}
                  </NavLink>
                </NavItem>
                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                  <NavLink
                    className={activeTab === "4" ? "active" : ""}
                    onClick={() => setActiveTab("4")}
                  >
                    {t("product_details.writeReview")}
                  </NavLink>
                </NavItem>
              </Nav>
              <TabContent activeTab={activeTab} className="nav-material">
                <TabPane tabId="1">
                  <p className="mb-0 pb-0">{item?.description}</p>
                </TabPane>
                <TabPane tabId="2">
                  <div className="product-details">
                    <div className="row">
                      <section className="product-overview col-md-6">
                        <h2>{item?.title}</h2>
                        <p>
                          <strong>Price:</strong> ${item?.price}{" "}
                          {item?.discount > 0 && (
                            <span style={{ color: "green" }}>
                              (Discount: {item?.discount}%)
                            </span>
                          )}
                        </p>
                        <p>
                          <strong>SKU:</strong> {item?.SKU}
                        </p>
                        <p>
                          <strong>Status:</strong> {item?.status}
                        </p>
                        <p>
                          <strong>Meta Description:</strong>{" "}
                          {item?.metaDescription}
                        </p>
                      </section>

                      <section className="features col-md-6">
                        <h3>Features</h3>
                        {!isDigital && (
                          <>
                            <p>
                              <strong>Colors Available:</strong>{" "}
                              {item?.colors.join(", ")}
                            </p>
                            <p>
                              <strong>Sizes Available:</strong>{" "}
                              {item?.sizes.join(", ")}
                            </p>
                          </>
                        )}

                        {isDigital && (
                          <div className="border-product">
                            <p>
                              <strong>{t("product_details.format")}</strong>:{" "}
                              {item.fileFormat}
                            </p>
                            <p>
                              <strong>{t("product_details.size")}</strong>:{" "}
                              {item.fileSize}
                            </p>
                            <p>
                              <strong>{t("product_details.version")}</strong>:{" "}
                              {item.version}
                            </p>
                            <p>
                              <strong>
                                {t("product_details.compatibility")}
                              </strong>
                              : {item.compatibility?.join(", ")}
                            </p>
                          </div>
                        )}
                      </section>
                    </div>

                    <div className="row">
                      <section className="category-info col-md-6">
                        <h3>Category Information</h3>
                        <p>
                          <strong>Category:</strong> {item?.category?.name}
                        </p>
                        <p>{item?.category?.description}</p>
                        <p>
                          <strong>Subcategory:</strong>{" "}
                          {item?.subcategory?.name}
                        </p>
                        <p>{item?.subcategory?.description}</p>
                      </section>

                      {!isDigital && (
                        <section className="stock-info col-md-6">
                          <h3>Stock Information</h3>
                          <p>
                            <strong>Stock Quantity:</strong>{" "}
                            {item?.stockQuantity}
                          </p>
                        </section>
                      )}
                    </div>

                    <div className="row">
                      <section className="images col-md-6">
                        <h3>Product Images</h3>
                        <div className="image-gallery">
                          {item?.images.map((image, index) => (
                            <img
                              key={index}
                              src={process.env.NEXT_PUBLIC_API_KEY + image}
                              alt={`${item?.title} ${index + 1}`}
                              className="img-fluid"
                              style={{ width: "100px", margin: "5px" }}
                            />
                          ))}
                        </div>
                      </section>

                      <section className="tags col-md-6">
                        <h3>Tags</h3>
                        <p>{item?.tags.join(", ")}</p>
                      </section>
                    </div>
                  </div>
                </TabPane>

                <TabPane tabId="3">
                  <p className="mb-0 pb-0">Video content here...</p>
                </TabPane>
                <TabPane tabId="4">
                  <div className="product-reviews">
                    <h3 className="mb-4">Customer Reviews</h3>

                    {loading && (
                      <div className="text-center mb-4">
                        <Spinner color="primary" />
                        <p>Loading reviews...</p>
                      </div>
                    )}

                    {!loading && reviewsData?.getReviews?.length === 0 && (
                      <div className="text-center mb-4">
                        <p>No reviews found for this product.</p>
                      </div>
                    )}

                    {reviewsData?.getReviews?.length > 0 && (
                      <div className="mb-4">
                        <h4>
                          <strong>Average Rating:</strong> {averageRating}/5
                        </h4>
                        <p>
                          Based on {reviewsData?.getReviews?.length} review(s)
                        </p>
                      </div>
                    )}

                    <div className="review-list mb-4">
                      {currentReviews?.map((review, index) => (
                        <div className="border p-3 mb-3 rounded" key={index}>
                          <div className="d-flex justify-content-between">
                            <p>
                              <strong>User:</strong> {review.userId.firstname}{" "}
                              {review.userId.lastname}
                            </p>
                            <p>
                              <strong>Email:</strong> {review.userId.email}
                            </p>
                            <p className="mb-0">
                              <strong>Date:</strong>{" "}
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                          <div className="d-flex justify-content-between">
                            <p>
                              <strong>Rating:</strong>{" "}
                              {"★".repeat(review.rating)}
                            </p>
                            <p>
                              <strong>Comment:</strong> {review.comment}
                            </p>
                            {review.userId.id === userData?.id && (
                              <p>
                                <button
                                  onClick={() => handleEditReview(review)}
                                >
                                  Edit Review
                                </button>
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <Pagination>
                        <PaginationItem disabled={currentPage === 1}>
                          <PaginationLink
                            previous
                            onClick={() => handlePageChange(currentPage - 1)}
                          />
                        </PaginationItem>
                        {[...Array(totalPages).keys()].map((page) => (
                          <PaginationItem
                            key={page + 1}
                            active={currentPage === page + 1}
                          >
                            <PaginationLink
                              onClick={() => handlePageChange(page + 1)}
                            >
                              {page + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem disabled={currentPage === totalPages}>
                          <PaginationLink
                            next
                            onClick={() => handlePageChange(currentPage + 1)}
                          />
                        </PaginationItem>
                      </Pagination>
                    )}

                    <div className="write-review">
                      <h3 className="mb-3">
                        {editingReviewId ? "Edit Review" : "Write a Review"}
                      </h3>
                      <Form onSubmit={handleSubmit}>
                        <FormGroup>
                          <Label for="rating">
                            <strong>Rating:</strong>
                          </Label>
                          <div>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                onClick={() => setRating(star)}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "1.5rem",
                                  color: star <= rating ? "gold" : "lightgray",
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </FormGroup>
                        <FormGroup>
                          <Label for="comment">
                            <strong>Comment:</strong>
                          </Label>
                          <Input
                            type="textarea"
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your review here..."
                            required
                          />
                        </FormGroup>
                        <Button color="primary" type="submit">
                          {editingReviewId ? "Update Review" : "Submit Review"}
                        </Button>
                      </Form>
                    </div>
                  </div>
                </TabPane>
              </TabContent>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ProductTab;
