//@ts-nocheck
import React from "react";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";

const GeneralFormBottom = ({ formData, setFormData }) => {
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>Free Shipping</Label>
          </Col>
          <Col md="7">
            <Label className="d-block">
              <Input
                className="checkbox_animated"
                id="chk-ani2"
                type="checkbox"
                name="allowFreeShipping"
                checked={formData.allowFreeShipping}
                onChange={handleInputChange}
              />
              Allow Free Shipping
            </Label>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>Quantity</Label>
          </Col>
          <Col md="7">
            <Input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>Discount Type</Label>
          </Col>
          <Col md="7">
            <select
              className="form-select"
              name="discountType"
              value={formData.discountType}
              onChange={handleInputChange}
              required
            >
              <option value="">--Select--</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>Discount Value</Label>
          </Col>
          <Col md="7">
            <Input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleInputChange}
              required
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>Status</Label>
          </Col>
          <Col md="7">
            <Label className="d-block">
              <Input
                className="checkbox_animated"
                id="chk-ani2"
                type="checkbox"
                name="statusActive"
                checked={formData.statusActive}
                onChange={handleInputChange}
              />
              Enable the Coupon
            </Label>
          </Col>
        </Row>
      </FormGroup>
    </>
  );
};

export default GeneralFormBottom;
