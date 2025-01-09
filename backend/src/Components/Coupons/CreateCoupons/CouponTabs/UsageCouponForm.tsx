import { Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { useState, ChangeEvent } from "react";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

interface FormData {
  usageLimit: number;
  perCustomerLimit: number;
}

interface UsageFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const UsageForm: React.FC<UsageFormProps> = ({ formData, setFormData }) => {

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: parseFloat(value) });
  };

  return (
    <Form className="needs-validation" noValidate>
      <h4>{t("coupon.addcoupon.usage_limits")}</h4>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>{t("coupon.addcoupon.per_limit")}</Label>
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
            <Label>{t("coupon.addcoupon.per_customer")}</Label>
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
