import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import sizeChart from "../../../public/assets/images/size-chart.jpg";
import { Modal, ModalBody, ModalHeader, Media, Input } from "reactstrap";
import CountdownComponent from "../../../components/common/widgets/countdownComponent";
import MasterSocial from "./master_social";
import CartContext from "../../../helpers/cart";

const DetailsWithPrice = ({ item, stickyClass }) => {
  const [modal, setModal] = useState(false);
  const [activeSize, setActiveSize] = useState(null);
  const [activeColor, setActiveColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const toggle = () => setModal(!modal);
  const context = useContext(CartContext);

  const product = item;
  const stockQuantity = item?.stockQuantity;

  const IncrementItem = () => {
    if (quantity < stockQuantity) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    } else {
      console.log("Max quantity reached:", quantity);
    }
  };

  const DecreaseItem = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    } else {
      console.log("Min quantity reached:", quantity);
    }
  };

  const handleChange = (event) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (isNaN(newQuantity)) {
      setQuantity(1);
    } else if (newQuantity <= stockQuantity && newQuantity > 0) {
      setQuantity(newQuantity);
    } else {
      setQuantity(stockQuantity);
    }
  };

  return (
    <>
      <div className={`product-right ${stickyClass}`}>
        <h2> {product.title} </h2>
        <h4>
          <del>{product.price}</del>
          <span>{product.discount / 10}% off</span>
        </h4>
        <h3>
          {product.price - (product.price * (product.discount / 10)) / 100}
        </h3>

        {product?.colors && product.colors.length > 0 && (
          <ul className="color-variant">
            {product.colors.map((color, index) => (
              <li
                key={index}
                style={{ backgroundColor: color }}
                className={`color-item ${
                  activeColor === index ? "active" : ""
                }`}
                onClick={() => setActiveColor(index)}
              ></li>
            ))}
          </ul>
        )}

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
              {product?.sizes?.map((size, i) => (
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

        <h6 className="product-title">Quantity</h6>
        <div className="qty-box">
          <div className="input-group">
            <span className="input-group-prepend">
              <button
                type="button"
                className="btn quantity-left-minus"
                onClick={DecreaseItem}
                disabled={quantity <= 1}
              >
                <i className="fa fa-angle-left"></i>
              </button>
            </span>
            <Input
              type="number"
              name="quantity"
              className="form-control input-number"
              value={quantity}
              onChange={handleChange}
              min="1"
              max={stockQuantity}
            />
            <span className="input-group-prepend">
              <button
                type="button"
                className="btn quantity-right-plus"
                onClick={IncrementItem}
                disabled={quantity >= stockQuantity}
              >
                <i className="fa fa-angle-right"></i>
              </button>
            </span>
          </div>
        </div>

        <div className="product-buttons">
          <button
            onClick={() =>
              context.addToCart(
                {
                  ...product,
                  selectedSize: product?.sizes?.[activeSize],
                  selectedColor: product?.colors?.[activeColor],
                },
                quantity
              )
            }
            className="btn btn-solid"
          >
            Add to Cart
          </button>
          <Link href={`/page/account/checkout`} className="btn btn-solid">
            Buy Now
          </Link>
        </div>

        <div className="border-product">
          <h6 className="product-title">Product Details</h6>
          <p>{product.description}</p>
        </div>

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
    </>
  );
};

export default DetailsWithPrice;
