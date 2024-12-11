import { useState } from "react";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";

interface FormData {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
}

interface GeneFormTopProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const GeneFormTop: React.FC<GeneFormTopProps> = ({ formData, setFormData }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  return (
    <>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* Name</Label>
          </Col>
          <Col md="7">
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* Code</Label>
          </Col>
          <Col md="7">
            <Input
              id="code"
              type="text"
              required
              value={formData.code}
              onChange={handleInputChange}
            />
            <div className="valid-feedback">
              Please Provide a Valid Coupon Code.
            </div>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>Start Date</Label>
          </Col>
          <Col md="7">
            <Input
              id="startDate"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>End Date</Label>
          </Col>
          <Col md="7">
            <Input
              id="endDate"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </Col>
        </Row>
      </FormGroup>
    </>
  );
};

export default GeneFormTop;
