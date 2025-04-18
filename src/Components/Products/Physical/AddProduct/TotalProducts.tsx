import { useState } from "react";
import { Button, Col, FormGroup, Input, InputGroup, InputGroupText, Label, Row } from "reactstrap";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

interface FormData {
  product_stockquantity: number;
}

interface TotalProductsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: any
}

const TotalProducts: React.FC<TotalProductsProps> = ({ formData, setFormData, errors }) => {
  const [quantity, setQuantity] = useState<number>(formData.product_stockquantity || 1);
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const IncrementItem = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    setFormData((prev) => ({ ...prev, product_stockquantity: newQuantity }));
  };

  const DecreaseItem = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      setFormData((prev) => ({ ...prev, product_stockquantity: newQuantity }));
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value, 10) || 0;
    setQuantity(newQuantity);
    setFormData((prev) => ({ ...prev, product_stockquantity: newQuantity }));
  };

  return (
    <FormGroup className="mb-3">
      <Row>
        <Col xl="3" sm="4">
          <Label className="fw-bold mb-0">{t("physical.addProduct.stockQuantity")} :</Label>
        </Col>
        <fieldset className="qty-box ms-0 ">
          <InputGroup className="bootstrap-touchspin">
            <div className="input-group-prepend">
              <Button
                color="primary"
                className="btn-square bootstrap-touchspin-down"
                onClick={DecreaseItem}
              >
                <i className="fa fa-minus"></i>
              </Button>
            </div>
            <div className="input-group-prepend">
              <InputGroupText className="bootstrap-touchspin-prefix"></InputGroupText>
            </div>
            <Input
              className="touchspin"
              type="text"
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
              >
                <i className="fa fa-plus"></i>
              </Button>
            </div>
          </InputGroup>
        </fieldset>
        <div className="row">
          <div className="col-sm-4 col-xl-3">

          </div>
          <div className="col-sm-7 col-xl-8 px-4">

            {errors?.product_stockquantity && <div className="errorMsg">{errors?.product_stockquantity}</div>}
          </div>
        </div>
      </Row>
    </FormGroup>
  );
};

export default TotalProducts;