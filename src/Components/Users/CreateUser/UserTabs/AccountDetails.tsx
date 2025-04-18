import React, { useState } from "react";
import { Form, FormGroup, Input, Label, Row, Col, Button } from "reactstrap";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";


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
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };


  return (
    <Form className="needs-validation user-add" onSubmit={handleSubmit}>
      <h4>{t("user.create_user.account.accountDetails")}</h4>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* {t("user.create_user.account.firstName")}</Label>
          </Col>
          <Col xl="8" md="7">
            <Input
              id="firstName"
              type="text"
              required
              value={formData.firstName || ""}
              onChange={handleInputChange}
            />
            {errors.firstName && <div className="errorMsg">{errors.firstName}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* {t("user.create_user.account.lastName")}</Label>
          </Col>
          <Col xl="8" md="7">
            <Input
              id="lastName"
              type="text"
              required
              value={formData.lastName || ""}
              onChange={handleInputChange}
            />
            {errors.lastName && <div className="errorMsg">{errors.lastName}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* {t("user.create_user.account.email")}</Label>
          </Col>
          <Col xl="8" md="7">
            <Input
              id="email"
              type="email"
              required
              value={formData.email || ""}
              onChange={handleInputChange}
            />
            {errors.email && <div className="errorMsg">{errors.email}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* {t("user.create_user.account.password")}</Label>
          </Col>
          <Col xl="8" md="7">
            <Input
              id="password"
              type="password"
              required
              value={formData.password || ""}
              onChange={handleInputChange}
            />
            {errors.password && <div className="errorMsg">{errors.password}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* {t("user.create_user.account.confirmPassword")}</Label>
          </Col>
          <Col xl="8" md="7">
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword || ""}
              onChange={handleInputChange}
            />
            {errors.confirmPassword && <div className="errorMsg">{errors.confirmPassword}</div>}
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

export default AccountDetails;
