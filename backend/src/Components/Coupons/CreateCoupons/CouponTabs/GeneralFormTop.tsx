import { useTranslation } from "@/app/i18n/client";
import { useAppSelector } from "@/Redux/Hooks";
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
  errors:any
}

const GeneFormTop: React.FC<GeneFormTopProps> = ({ formData, setFormData,errors }:any) => {

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  return (
    <>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* {t("coupon.addcoupon.name")}</Label>
          </Col>
          <Col md="7">
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors?.name && <div className="errorMsg">{errors?.name}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>* {t("coupon.addcoupon.code")}</Label>
          </Col>
          <Col md="7">
            <Input
              id="code"
              type="text"
              required
              value={formData.code}
              onChange={handleInputChange}
            />
            {errors?.code && <div className="errorMsg">{errors?.code}</div>}
            <div className="valid-feedback">
              Please Provide a Valid Coupon Code.
            </div>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>{t("coupon.addcoupon.start_date")}</Label>
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
            {errors?.startDate && <div className="errorMsg">{errors?.startDate}</div>}
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>{t("coupon.addcoupon.end_date")}</Label>
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
            {errors?.endDate && <div className="errorMsg">{errors?.endDate}</div>}
          </Col>
        </Row>
      </FormGroup>
    </>
  );
};

export default GeneFormTop;
