import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import CommonCardHeader from "@/CommonComponents/CommonCardHeader";
import { Fragment } from "react";
import { Card, CardBody, Container } from "reactstrap";
import CouponTabs from "./CouponTabs";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";

const CreateCoupons = () => {

    const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
    const { t } = useTranslation(i18LangStatus);

  return (
    <Fragment>
      <CommonBreadcrumb title={t("coupon.addcoupon.create_coupon")} parent={t("coupon.addcoupon.coupon")} />
      <Container fluid>
        <Card>
          <CommonCardHeader title={t("coupon.addcoupon.discount_coupon_details")} />
          <CardBody>
            <CouponTabs />
          </CardBody>
        </Card>
      </Container>
    </Fragment>
  );
};

export default CreateCoupons;
