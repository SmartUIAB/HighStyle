import React from "react";
import MasterServiceContent from "../../../../components/common/Service/MasterServiceConternt";
import {
  svgFreeShipping,
  svgservice,
  svgoffer,
  svgpayment,
} from "../../../../services/script";
import { useTranslation } from "react-i18next";

const Service = () => {
  const { t } = useTranslation();

  const Data = [
    {
      link: svgFreeShipping,
      title: t("services.freeShipping"),
      service: t("services.freeShippingWorldwide"),
    },
    {
      link: svgservice,
      title: t("services.service247"),
      service: t("services.onlineService247"),
    },
    {
      link: svgoffer,
      title: t("services.festivalOffer"),
      service: t("services.newOnlineSpecialFestivalOffer"),
    },
    {
      link: svgpayment,
      title: t("services.onlinePayment"),
      service: t("services.newOnlineSpecialFestivalOffer"),
      lastChild: true,
    },
  ];

  return (
    <div className="collection-filter-block">
      <div className="product-service">
        {Data.map((data, index) => (
          <MasterServiceContent
            key={index}
            link={data.link}
            title={data.title}
            service={data.service}
            lastChild={data.lastChild}
          />
        ))}
      </div>
    </div>
  );
};

export default Service;
