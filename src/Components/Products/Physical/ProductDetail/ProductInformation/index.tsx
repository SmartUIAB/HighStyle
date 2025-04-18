//@ts-nocheck
import { Href, ImagePath } from "@/Constants";
import { SetStateAction, useState } from "react";
import ReactStars from "react-rating-stars-component";
import { Button, Col, Modal, ModalHeader } from "reactstrap";
import ProductQuantity from "./ProductQuantity";
import ProductTimer from "./ProductTimer";

const ProductInformation = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(data?.rating || 1);
  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(data?.stockQuantity || 1);
  const [color, setColor] = useState()

  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  const onStarClick = (nextValue: SetStateAction<number>) => {
    setRating(nextValue);
  };

  const handleAddToCart = () => {
    const selectedSize = data?.sizes ? data.sizes[active] : null;

    const cartData = {
      id: data?.id || null,
      title: data?.title || "Unknown Product",
      price: data?.price || 0,
      quantity,
      size: selectedSize,
      rating,
      colors: color || data?.colors[0],
      description: data?.description || "No description available",
    };

    console.log("Product added to cart:", cartData);

    alert("Product added to cart! Check the console for details.");
  };

  return (
    <Col xl="8">
      <div className="product-page-details product-right mb-0">
        <h2>{data?.title || "Product Title"}</h2>

        <div style={{ fontSize: 27, height: 31 }}>
          <ReactStars
            count={5}
            onChange={onStarClick}
            size={40}
            activeColor="#ffd700"
            value={rating}
          />
        </div>

        <hr />

        <h6 className="product-title">Product Details</h6>
        <p>{data?.description || "No description available."}</p>

        <div className="product-price digits mt-2">
          <h3>
            ${data?.price || "0.00"}{" "}
            {data?.discount && <del>${data?.discount}</del>}
          </h3>
        </div>

        {data?.colors && data.colors.length > 0 && (
          <ul className="color-variant">
            {data.colors.map((color: string, index: number) => (
              <li
                key={index}
                style={{ backgroundColor: color }}
                className="color-item"
                onClick={() => setColor(color)}
              ></li>
            ))}
          </ul>
        )}

        <hr />
        <h6 className="product-title size-text">
          Select Size
          {data?.category?.name === "Apparel" && (
            <span className="pull-right">
              <a
                href={Href}
                data-toggle="modal"
                data-target="#sizemodal"
                onClick={onOpenModal}
              >
                Size Chart
              </a>
            </span>
          )}
        </h6>
        {data?.category?.name === "Apparel" && (
          <Modal className="size-modal" isOpen={open} toggle={onCloseModal}>
            <ModalHeader toggle={onCloseModal}>
              <img
                src={`${ImagePath}/size-chart.jpg`}
                alt="Size Chart"
                className="img-fluid blur-up lazyloaded"
              />
            </ModalHeader>
          </Modal>
        )}

        <div className="size-box">
          <ul className="list-inline">
            {data?.sizes?.map((item: string, i: number) => (
              <li
                key={i}
                className={`list-inline-item px-2 py-1 border rounded text-center ${active === i ? "bg-danger text-white" : "border-secondary"
                  }`}
                onClick={() => setActive(i)}
                style={{ cursor: "pointer", minWidth: "80px" }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <ProductQuantity
          data={data?.stockQuantity || 1}
          onQuantityChange={(newQuantity) => setQuantity(newQuantity)}
        />
        <hr />
        <ProductTimer />

        <div className="m-t-15">
          <Button color="primary" className="m-r-10" onClick={handleAddToCart}>
            Add To Cart
          </Button>
          <Button color="secondary">Buy Now</Button>
        </div>
      </div>
    </Col>
  );
};

export default ProductInformation;
