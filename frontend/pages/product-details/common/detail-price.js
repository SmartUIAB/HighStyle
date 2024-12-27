import React, { useState, useContext } from "react";
import Link from "next/link";
import sizeChart from "../../../public/assets/images/size-chart.jpg";
import { Modal, ModalBody, ModalHeader, Media, Input } from "reactstrap";
import CountdownComponent from "../../../components/common/widgets/countdownComponent";
import MasterSocial from "./master_social";
import CartContext from "../../../helpers/cart";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { CREATE_ADD_TO_CART } from "../../../GraphQL/Mutations/cartMutations";

const DetailsWithPrice = ({ item, stickyClass }) => {
  const [modal, setModal] = useState(false);
  const [activeSize, setActiveSize] = useState(null);
  const [activeColor, setActiveColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const toggle = () => setModal(!modal);

  const [createcart] = useMutation(CREATE_ADD_TO_CART);

  const product = item;
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
    if (product) {
      const userData = JSON.parse(localStorage.getItem("customerDetail"));
      const { data } = await createcart({
        variables: {
          input: {
            userId: userData?.id,
            products: {
              ProductID: product.id,
              price: product.price,
              quantity: quantity,
              color: product.colors?.[activeColor] || null,
              size: product.sizes?.[activeSize] || null,
              totalAmount: product.price * quantity,
              title: product.title,
            },
          },
        },
      });
      if (data) {
        toast.success("Product Added to Cart");
      } else {
        toast.error("Product not Added to Cart");
      }
    }
  };

  return (
    <div className={`product-right ${stickyClass}`}>
      <h2>{product?.title}</h2>
      <h4>
        <del>{product?.price}</del>
        <span>{product?.discount}% off</span>
      </h4>
      <h3>{product?.price - (product?.price * product?.discount) / 100}</h3>

      {!isDigital && product?.colors?.length > 0 && (
        <ul className="color-variant">
          {product.colors.map((color, index) => (
            <li
              key={index}
              style={{ backgroundColor: color }}
              className={`color-item ${activeColor === index ? "active" : ""}`}
              onClick={() => setActiveColor(index)}
            ></li>
          ))}
        </ul>
      )}

      {!isDigital && product?.sizes?.length > 0 && (
        <div className="product-description border-product">
          <h6 className="product-title size-text">
            Select size
            <span>
              <a href={null} onClick={toggle}>
                Size chart
              </a>
            </span>
          </h6>
          <Modal isOpen={modal} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>Size Chart</ModalHeader>
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

      <h6 className="product-title">Quantity</h6>
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
          Add to Cart
        </button>
        <Link href="/page/account/checkout" className="btn btn-solid">
          Buy Now
        </Link>
      </div>

      <div className="border-product">
        <h6 className="product-title">Product Details</h6>
        <p>{product?.description}</p>
      </div>

      {isDigital && (
        <div className="border-product">
          <h6 className="product-title">File Details</h6>
          <ul>
            <li>Format: {product.fileFormat}</li>
            <br />
            <li>Size: {product.fileSize}</li>
            <br />
            <li>Version: {product.version}</li>
            <br />
            <li>Compatibility: {product.compatibility?.join(", ")}</li>
          </ul>
        </div>
      )}

      <div className="border-product">
        <h6 className="product-title">Share It</h6>
        <div className="product-icon">
          <MasterSocial />
        </div>
      </div>

      <div className="border-product">
        <h6 className="product-title">Time Reminder</h6>
        <CountdownComponent />
      </div>
    </div>
  );
};

export default DetailsWithPrice;
