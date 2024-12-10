import MDEditor from "@uiw/react-md-editor";
import { useEffect, useState } from "react";
import { Col, Form, FormGroup, Input, Label, Row } from "reactstrap";

interface FormData {
  product_size: string;
  product_description: string;
}

interface ProductSizeAndDescriptionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const ProductSizeAndDescription: React.FC<ProductSizeAndDescriptionProps> = ({
  formData,
  setFormData,
}) => {
  const [value, setValue] = useState<string | undefined>("");

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
            <Label className="fw-bold mb-0">Select Size :</Label>
          </Col>
          <Col xl="8" sm="7">
            <Input
              className="form-control digits"
              id="exampleFormControlSelect1"
              onChange={handleSizeChange}
              value={formData.product_size}
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup className="mb-3">
        <Row>
          <Col xl="3" sm="4">
            <Label className="fw-bold">Add Description :</Label>
          </Col>
          <Col xl="8" sm="7" className="description-sm">
            <MDEditor value={value} onChange={handleDescriptionChange} />
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

export default ProductSizeAndDescription;
