import { Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { useState, ChangeEvent } from "react";

interface FormData {
  usageLimit: number;
  perCustomerLimit: number;
}

interface UsageFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const UsageForm: React.FC<UsageFormProps> = ({ formData, setFormData }) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) });
  };

  return (
    <Form className="needs-validation" noValidate>
      <h4>Usage Limits</h4>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>Per Limit</Label>
          </Col>
          <Col md="7">
            <Input
              id="validationCustom6"
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleInputChange}
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>Per Customer</Label>
          </Col>
          <Col md="7">
            <Input
              id="validationCustom7"
              type="number"
              name="perCustomerLimit"
              value={formData.perCustomerLimit}
              onChange={handleInputChange}
            />
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

export default UsageForm;
