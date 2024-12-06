import MDEditor from "@uiw/react-md-editor";
import { SetStateAction, useState } from "react";
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

  const handleDescriptionChange = (e: SetStateAction<string | undefined>) => {
    setValue(e);
    setFormData((prevState: any) => ({
      ...prevState,
      product_description: e || "",
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
            >
            </Input>
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