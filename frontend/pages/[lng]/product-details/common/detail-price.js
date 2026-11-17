import React, { useState } from "react";
import sizeChart from "../../../../public/assets/images/size-chart.jpg";
import { Modal, ModalBody, ModalHeader, Media, Input } from "reactstrap";
import CountdownComponent from "../../../../components/common/widgets/countdownComponent";
import MasterSocial from "./master_social";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { CREATE_ADD_TO_CART } from "../../../../GraphQL/Mutations/cartMutations";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

const DetailsWithPrice = ({ item, stickyClass }) => {
  const { t } = useTranslation();
  const [modal, setModal] = useState(false);
  const [activeSize, setActiveSize] = useState(null);
  const [activeColor, setActiveColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const toggle = () => setModal(!modal);
  const router = useRouter();

  const [createcart] = useMutation(CREATE_ADD_TO_CART);

  const product = item;
  const isDigital = product?.__typename === "DigitalProduct";
  const stockQuantity = isDigital ? 99 : Math.min(99, product?.stockQuantity || 0);
  const price = Number(product?.price || 0);
  const discount = Number(product?.discount || 0);
  const discountedPrice = Math.max(0, price * (1 - discount / 100));

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

  const handleAddToCart = async () => {
    try {
      const customerDetail = JSON.parse(localStorage.getItem("customerDetail"));
      if (!customerDetail || customerDetail === "null") {
        router.replace("/page/account/login");
        return;
      }

      if (!product) return;

      if (!isDigital && ((product.colors?.length && activeColor === null) || (product.sizes?.length && activeSize === null))) {
        toast.error(t("product_details.selectColorAndSize"));
        return;
      }

      if (!customerDetail?.id) {
        toast.error(t("product_details.userNotFound"));
        return;
      }

      const { data } = await createcart({
        variables: {
          input: {
            userId: customerDetail.id,
            products: [
              {
                ProductID: product.id,
                price: product.price,
                quantity,
                color: product.colors?.[activeColor] || null,
                size: product.sizes?.[activeSize] || null,
                totalAmount: product.price * quantity,
                title: product.title,
              },
            ],
          },
        },
      });

      if (data) {
        toast.success(t("product_details.addToCart"));
      } else {
        toast.error(t("product_details.addToCartError"));
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(t("product_details.addToCartError"));
    }
  };

  return (
    <div className={`product-right ${stickyClass}`}>
      <h2>{product?.title}</h2>
      {discount > 0 && (
        <h4><del>{price.toFixed(2)} USD</del><span> {discount}% {t("product_details.off")}</span></h4>
      )}
      <h3>{discountedPrice.toFixed(2)} USD</h3>

      {!isDigital && product?.colors?.length > 0 && (
        <ul className="color-variant d-flex list-unstyled">
          {product.colors.map((color, index) => (
            <li
              key={index}
              style={{
                backgroundColor: color,
                width: "30px",
                height: "30px",
                cursor: "pointer",
              }}
              className={`color-item rounded-circle border ${
                activeColor === index
                  ? "border-primary border-3"
                  : "border-secondary"
              }`}
              onClick={() => setActiveColor(index)}
            ></li>
          ))}
        </ul>
      )}

      {!isDigital && product?.sizes?.length > 0 && (
        <div className="product-description border-product">
          <h6 className="product-title size-text">
            {t("product_details.selectSize")}
            <span>
              <a href={null} onClick={toggle}>
                {t("product_details.sizeChart")}
              </a>
            </span>
          </h6>
          <Modal isOpen={modal} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>
              {t("product_details.sizeChart")}
            </ModalHeader>
            <ModalBody>
              <Media src={sizeChart.src} alt="size" className="img-fluid" />
            </ModalBody>
          </Modal>
          <div className="size-box">
            <ul className="list-inline d-flex flex-wrap justify-content-start">
              {product.sizes.map((size, i) => (
                <li
                  key={i}
                  className={`list-inline-item px-3 py-2 border rounded text-center mx-1 my-1 ${
                    activeSize === i
                      ? "bg-danger text-white border-danger"
                      : "border-secondary"
                  }`}
                  onClick={() => setActiveSize(i)}
                  style={{
                    cursor: "pointer",
                    minWidth: "110px",
                    fontWeight: activeSize === i ? "bold" : "normal",
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  {size}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <h6 className="product-title">{t("product_details.quantity")}</h6>
      <div className="qty-box">
        <div className="input-group">
          <button
            type="button"
            className="btn quantity-left-minus"
            onClick={DecreaseItem}
            disabled={quantity <= 1}
          >
            <i className="fa fa-angle-left"></i>
          </button>
          <Input
            type="number"
            name="quantity"
            className="form-control input-number"
            value={quantity}
            onChange={handleChange}
            min="1"
            max={stockQuantity}
          />
          <button
            type="button"
            className="btn quantity-right-plus"
            onClick={IncrementItem}
            disabled={quantity >= stockQuantity}
          >
            <i className="fa fa-angle-right"></i>
          </button>
        </div>
      </div>

      <div className="product-buttons">
        <button
          onClick={() => handleAddToCart(product)}
          className="btn btn-solid"
        >
          {t("product_details.addToCart")}
        </button>
        <button
          onClick={() => handleAddToCart(product)}
          className="btn btn-solid"
        >
          {t("product_details.buyNow")}
        </button>
      </div>

      <div className="border-product">
        <h6 className="product-title">{t("product_details.productDetails")}</h6>
        <p>{product?.description}</p>
      </div>

      {isDigital && (
        <div className="border-product">
          <h6 className="product-title">{t("product_details.fileDetails")}</h6>
          <ul>
            <li>
              {t("product_details.format")}: {product.fileFormat}
            </li>
            <br />
            <li>
              {t("product_details.size")}: {product.fileSize}
            </li>
            <br />
            <li>
              {t("product_details.version")}: {product.version}
            </li>
            <br />
            <li>
              {t("product_details.compatibility")}:{" "}
              {product.compatibility?.join(", ")}
            </li>
          </ul>
        </div>
      )}

      <div className="border-product">
        <h6 className="product-title">{t("product_details.shareIt")}</h6>
        <div className="product-icon">
          <MasterSocial />
        </div>
      </div>

      <div className="border-product">
        <h6 className="product-title">{t("product_details.timeReminder")}</h6>
        <CountdownComponent />
      </div>
    </div>
  );
};

export default DetailsWithPrice;
