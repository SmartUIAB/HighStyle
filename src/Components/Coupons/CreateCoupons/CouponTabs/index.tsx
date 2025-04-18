//@ts-nocheck
import { Fragment, useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Button, Spinner } from "reactstrap";
import GeneralCouponForm from "./GeneralCouponForm";
import RestrictionForm from "./RestrictionCouponForm";
import UsageForm from "./UsageCouponForm";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_COUPON, UPDATE_COUPON } from '../../../../GraphQL/Mutations/couponMutations';
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { GET_COUPON_BY_ID } from "@/GraphQL/Queries/couponQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
import { couponSchema } from "@/utils/validation";

interface FormData {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  allowFreeShipping: boolean;
  quantity: number;
  discountType: string;
  discountValue: number;
  statusActive: boolean;
  restrictionProducts: string[];
  maxSpend: string;
  minSpend: string;
  perCustomerLimit: string;
  usageLimit: string;
}

const CouponTabs: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    startDate: "",
    endDate: "",
    allowFreeShipping: false,
    quantity: 0,
    discountType: "",
    discountValue: 0.0,
    statusActive: false,
    restrictionProducts: [],
    maxSpend: "",
    minSpend: "",
    perCustomerLimit: "",
    usageLimit: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [createCoupon] = useMutation(CREATE_COUPON);
  const [updateCoupon] = useMutation(UPDATE_COUPON);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);

  const { data: couponByID, refetch, loading: fetching } = useQuery(GET_COUPON_BY_ID, {
    variables: { getCouponByIdId: id },
    skip: !id,
  });

  useEffect(() => {
    if (couponByID) {
      setFormData({
        name: couponByID?.getCouponByID?.name,
        code: couponByID?.getCouponByID?.code,
        startDate: couponByID?.getCouponByID?.startDate
          ? new Date(parseInt(couponByID.getCouponByID.startDate)).toISOString().slice(0, 10)
          : "",
        endDate: couponByID?.getCouponByID?.endDate
          ? new Date(parseInt(couponByID.getCouponByID.endDate)).toISOString().slice(0, 10)
          : "",
        allowFreeShipping: couponByID?.getCouponByID?.allowFreeShipping,
        quantity: couponByID?.getCouponByID?.quantity,
        discountType: couponByID?.getCouponByID?.discountType,
        discountValue: couponByID?.getCouponByID?.discountValue,
        statusActive: couponByID?.getCouponByID?.statusActive,
        restrictionProducts: couponByID?.getCouponByID?.restrictionProducts,
        maxSpend: couponByID?.getCouponByID?.minSpend,
        minSpend: couponByID?.getCouponByID?.maxSpend,
        perCustomerLimit: couponByID?.getCouponByID?.perCustomerLimit,
        usageLimit: couponByID?.getCouponByID?.usageLimit,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        startDate: "",
        endDate: "",
        allowFreeShipping: false,
        quantity: 0,
        discountType: "",
        discountValue: 0.0,
        statusActive: false,
        restrictionProducts: [],
        maxSpend: "",
        minSpend: "",
        perCustomerLimit: "",
        usageLimit: "",
      });
    }
  }, [couponByID]);

  const handleNext = () => {
    if (selectedIndex < 2) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleSave = async () => {
    setErrors({});
    try {
      await couponSchema.validate(formData, { abortEarly: false });
    } catch (error) {
      if (error.inner) {
        const validationErrors: { [key: string]: string } = error.inner.reduce(
          (acc: any, error: any) => {
            acc[error.path] = error.message;
            return acc;
          },
          {}
        );
        console.log(validationErrors)
        setErrors(validationErrors)
        return;
      }
    }
    setLoading(true);
    try {
      if (id) {
        const { data } = await updateCoupon({
          variables: {
            updateCouponId: id,
            input: {
              name: formData.name,
              code: formData.code,
              startDate: formData.startDate,
              endDate: formData.endDate,
              allowFreeShipping: formData.allowFreeShipping,
              quantity: parseInt(formData.quantity.toString(), 10),
              discountType: formData.discountType,
              discountValue: parseFloat(formData.discountValue.toString()),
              statusActive: formData.statusActive,
              restrictionProducts: formData.restrictionProducts,
              maxSpend: parseFloat(formData.maxSpend.toString()),
              minSpend: parseFloat(formData.minSpend.toString()),
              perCustomerLimit: formData.perCustomerLimit,
              usageLimit: formData.usageLimit,
            },
          },
        });

        if (data) {
          toast.success('Coupon Updated Successfully');
          refetch();
        }
      } else {
        const { data } = await createCoupon({
          variables: {
            input: {
              name: formData.name,
              code: formData.code,
              startDate: formData.startDate,
              endDate: formData.endDate,
              allowFreeShipping: formData.allowFreeShipping,
              quantity: parseInt(formData.quantity.toString(), 10),
              discountType: formData.discountType,
              discountValue: parseFloat(formData.discountValue.toString()),
              statusActive: formData.statusActive,
              restrictionProducts: formData.restrictionProducts,
              maxSpend: parseFloat(formData.maxSpend.toString()),
              minSpend: parseFloat(formData.minSpend.toString()),
              perCustomerLimit: formData.perCustomerLimit,
              usageLimit: formData.usageLimit,
            },
          },
        });

        if (data) {
          toast.success('Coupon Created Successfully');
          setFormData({
            name: "",
            code: "",
            startDate: "",
            endDate: "",
            allowFreeShipping: false,
            quantity: 0,
            discountType: "",
            discountValue: 0.0,
            statusActive: false,
            restrictionProducts: [],
            maxSpend: "",
            minSpend: "",
            perCustomerLimit: "",
            usageLimit: "",
          });
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="d-flex justify-content-center py-5">
      <Spinner style={{ color: '#ff8084' }} />
    </div>;
  }

  return (
    <Fragment>
      <Tabs selectedIndex={selectedIndex} onSelect={(index) => setSelectedIndex(index)}>
        <TabList className="nav nav-tabs tab-coupon">
          <Tab className={`nav-link ${selectedIndex === 0 ? "active" : ""}`}>{t("coupon.addcoupon.general")}</Tab>
          <Tab className={`nav-link ${selectedIndex === 1 ? "active" : ""}`}>{t("coupon.addcoupon.restriction")}</Tab>
          <Tab className={`nav-link ${selectedIndex === 2 ? "active" : ""}`}>{t("coupon.addcoupon.usage")}</Tab>
        </TabList>
        <TabPanel>
          <div className="tab-pane fade active show">
            <GeneralCouponForm formData={formData} setFormData={setFormData} errors={errors} />
          </div>
        </TabPanel>
        <TabPanel>
          <RestrictionForm formData={formData} setFormData={setFormData} errors={errors} />
        </TabPanel>
        <TabPanel>
          <UsageForm formData={formData} setFormData={setFormData} errors={errors} />
        </TabPanel>
      </Tabs>
      <div className="pull-right">
        {selectedIndex < 2 ? (
          <Button onClick={handleNext} disabled={loading}>{t("coupon.addcoupon.next")}</Button>
        ) : (
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Spinner size="sm" color="light" /> : t("coupon.addcoupon.save")}
          </Button>
        )}
      </div>
    </Fragment>
  );
};

export default CouponTabs;
