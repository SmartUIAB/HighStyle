import { ChangeEvent, useEffect, useState } from "react";
import { Button, Input, InputGroup, InputGroupText } from "reactstrap";

interface ProductQuantityProps {
  data: number;
  maxQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
}

const ProductQuantity = ({ data, maxQuantity = data, onQuantityChange }: ProductQuantityProps) => {
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (onQuantityChange) {
      onQuantityChange(quantity);
    }
  }, [quantity, onQuantityChange]);

  const IncrementItem = () => {
    setQuantity((prevQuantity) => (prevQuantity < maxQuantity ? prevQuantity + 1 : prevQuantity));
  };

  const DecreaseItem = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="add-product-form">
      <h6 className="product-title">Quantity</h6>
      <fieldset className="qty-box mt-2 ms-0">
        <InputGroup className="bootstrap-touchspin">
          <div className="input-group-prepend">
            <Button
              color="primary"
              className="btn-square bootstrap-touchspin-down"
              onClick={DecreaseItem}
              disabled={quantity <= 1}
            >
              <i className="fa fa-minus"></i>
            </Button>
          </div>

          <div className="input-group-prepend">
            <InputGroupText className="bootstrap-touchspin-prefix"></InputGroupText>
          </div>
          <Input
            className="touchspin"
            type="number"
            min="1"
            value={quantity}
            onChange={handleChange}
          />
          <div className="input-group-append">
            <InputGroupText className="bootstrap-touchspin-postfix"></InputGroupText>
          </div>

          <div className="input-group-append ms-0">
            <Button
              color="primary"
              className="btn-square bootstrap-touchspin-up"
              onClick={IncrementItem}
              disabled={quantity >= maxQuantity}
            >
              <i className="fa fa-plus"></i>
            </Button>
          </div>
        </InputGroup>
      </fieldset>
    </div>
  );
};

export default ProductQuantity;
