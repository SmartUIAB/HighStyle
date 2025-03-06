import MDEditor from "@uiw/react-md-editor";
import { useEffect, useState } from "react";
import { Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

interface FormData {
  product_size: string;
  product_description: string;
}

interface ProductSizeAndDescriptionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: any
}

const ProductSizeAndDescription: React.FC<ProductSizeAndDescriptionProps> = ({
  formData,
  setFormData,
  errors
}) => {
  const [value, setValue] = useState<string | undefined>("");
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  // Update the local editor value when formData.product_description changes
  useEffect(() => {
    setValue(formData.product_description);
  }, [formData.product_description]);

  const handleDescriptionChange = (value: string | undefined) => {
    setValue(value);
    setFormData((prevState) => ({
      ...prevState,
      product_description: value || "",
    }));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedSize = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      product_size: selectedSize,
    }));
  };

  return (
    <Form>
      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold mb-0">{t("physical.addProduct.selectSize")} :</Label>
          </Col>
          <Col xl="8" sm="7">
            <Input
              className="form-control digits"
              id="exampleFormControlSelect1"
              onChange={handleSizeChange}
              value={formData.product_size}
            />
            {errors?.product_size && <div className="errorMsg">{errors?.product_size}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold">{t("physical.addProduct.addDescription")} :</Label>
          </Col>
          <Col xl="8" sm="7" className="description-sm">
            <MDEditor value={value} onChange={handleDescriptionChange} />
            {errors?.product_description && <div className="errorMsg">{errors?.product_description}</div>}
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

export default ProductSizeAndDescription;
