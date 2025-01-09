//@ts-nocheck
import { useTranslation } from "@/app/i18n/client";
import { useAppSelector } from "@/Redux/Hooks";
import React from "react";
import { Col, FormGroup, Input, Label, Row } from "reactstrap";

const GeneralFormBottom = ({ formData, setFormData }) => {

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
    const { t } = useTranslation(i18LangStatus);

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
            <Label>{t("coupon.addcoupon.free_shipping")}</Label>
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
              {t("coupon.addcoupon.allow_free_shipping")}
            </Label>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xl="3" md="4">
            <Label>{t("coupon.addcoupon.quantity")}</Label>
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
            <Label>{t("coupon.addcoupon.discount_type")}</Label>
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
            <Label>{t("coupon.addcoupon.discount_value")}</Label>
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
            <Label>{t("coupon.addcoupon.status")}</Label>
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
              {t("coupon.addcoupon.enable_the_coupon")}
            </Label>
          </Col>
        </Row>
      </FormGroup>
    </>
  );
};

export default GeneralFormBottom;
