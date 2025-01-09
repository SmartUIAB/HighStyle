import { Col, Form, Row } from "reactstrap";
import GeneralFormBottom from "./GeneralFormBottom";
import GeneFormTop from "./GeneralFormTop";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const GeneralCouponForm = ({formData,setFormData}) => {

    const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
    const { t } = useTranslation(i18LangStatus);

  return (
    <Form className="needs-validation" noValidate>
      <h4>{t("coupon.addcoupon.general")}</h4>
      <Row>
        <Col sm="12">
          <GeneFormTop formData={formData} setFormData={setFormData} />
          <GeneralFormBottom formData={formData} setFormData={setFormData} />
        </Col>
      </Row>
    </Form>
  );
};

export default GeneralCouponForm;
