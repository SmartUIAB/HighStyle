import React, { useState } from "react";
import { Form, FormGroup, Input, Label, Row, Col, Button } from "reactstrap";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface AccountDetailsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleSubmit: any
  errors: any
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ formData, setFormData, handleSubmit, errors }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };


  return (
    <Form className="needs-validation user-add" onSubmit={handleSubmit}>
      <h4>Account Details</h4>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* First Name</Label>
          </Col>
          <Col xl="8" md="7">
            <Input
              id="firstName"
              type="text"
              required
              value={formData.firstName || ""}
              onChange={handleInputChange}
              invalid={!!errors.firstName}
            />
            {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* Last Name</Label>
          </Col>
          <Col xl="8" md="7">
            <Input
              id="lastName"
              type="text"
              required
              value={formData.lastName || ""}
              onChange={handleInputChange}
              invalid={!!errors.lastName}
            />
            {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* Email</Label>
          </Col>
          <Col xl="8" md="7">
            <Input
              id="email"
              type="email"
              required
              value={formData.email || ""}
              onChange={handleInputChange}
              invalid={!!errors.email}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* Password</Label>
          </Col>
          <Col xl="8" md="7">
            <Input
              id="password"
              type="password"
              required
              value={formData.password || ""}
              onChange={handleInputChange}
              invalid={!!errors.password}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* Confirm Password</Label>
          </Col>
          <Col xl="8" md="7">
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword || ""}
              onChange={handleInputChange}
              invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

export default AccountDetails;
