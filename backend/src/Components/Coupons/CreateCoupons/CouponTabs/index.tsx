//@ts-nocheck
import { Fragment, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Button } from "reactstrap";
import GeneralCouponForm from "./GeneralCouponForm";
import RestrictionForm from "./RestrictionCouponForm";
import UsageForm from "./UsageCouponForm";
import { useMutation } from "@apollo/client";
import { CREATE_COUPON } from '../../../../GraphQL/Mutations/couponMutations';
import { toast } from "react-toastify";

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

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [createCoupon] = useMutation(CREATE_COUPON);

  const handleNext = () => {
    if (selectedIndex < 2) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleSave = async () => {
    try {
      console.log("Saving form data...", formData);
      const { data } = await createCoupon({
        variables: {
          input: {
            name: formData.name,
            code: formData.code,
            startDate: formData.startDate,
            endDate: formData.endDate,
            allowFreeShipping: formData.allowFreeShipping,
            quantity: parseInt(formData.quantity.toString(), 10),
            discountType: formData.discountType === "Percent" ? "percentage" : formData.discountType,
            discountValue: parseFloat(formData.discountValue.toString()),
            statusActive: formData.statusActive,
            restrictionProducts: formData.restrictionProducts,
            maxSpend: parseFloat(formData.maxSpend.toString()),
            minSpend: parseFloat(formData.minSpend.toString()),
            perCustomerLimit: formData.perCustomerLimit,
            usageLimit: formData.usageLimit
          }
        }
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

    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error('Failed to create coupon. Please try again later.');
    }
  };

  return (
    <Fragment>
      <Tabs selectedIndex={selectedIndex} onSelect={(index) => setSelectedIndex(index)}>
        <TabList className="nav nav-tabs tab-coupon">
          <Tab className={`nav-link ${selectedIndex === 0 ? "active" : ""}`}>General</Tab>
          <Tab className={`nav-link ${selectedIndex === 1 ? "active" : ""}`}>Restriction</Tab>
          <Tab className={`nav-link ${selectedIndex === 2 ? "active" : ""}`}>Usage</Tab>
        </TabList>
        <TabPanel>
          <div className="tab-pane fade active show">
            <GeneralCouponForm formData={formData} setFormData={setFormData} />
          </div>
        </TabPanel>
        <TabPanel>
          <RestrictionForm formData={formData} setFormData={setFormData} />
        </TabPanel>
        <TabPanel>
          <UsageForm formData={formData} setFormData={setFormData} />
        </TabPanel>
      </Tabs>
      <div className="pull-right">
        {selectedIndex < 2 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSave}>Save</Button>
        )}
      </div>
    </Fragment>
  );
};

export default CouponTabs;
