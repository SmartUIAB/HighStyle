import CommonBreadcrumb from "@/CommonComponents/CommonBreadcrumb";
import { GET_ALL_PERMISSIONS } from "@/GraphQL/Queries/userQueries";
import { useMutation, useQuery } from "@apollo/client";
import { Fragment, useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Button, Col, Container, Form, FormGroup, Input, Label, Row, Spinner } from "reactstrap";
import { CREATE_VENDOR, UPDATE_VENDOR } from "../../../GraphQL/Mutations/vendorMutations";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { VENDOR_BY_ID } from "@/GraphQL/Queries/vendorQueries";
import { useAppSelector } from "@/Redux/Hooks";
import { useTranslation } from "@/app/i18n/client";
import { vendorSchema } from "@/utils/validation";

interface FormData {
  name: string;
  businessType: string;
  email: string;
  address: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
  allowedPermissions: string[];
}

interface ErrorData {
  name: string;
  businessType: string;
  email: string;
  address: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
}

const CreateVendors = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const { t } = useTranslation(i18LangStatus);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    businessType: "",
    email: "",
    address: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    allowedPermissions: [],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { data: allPermissions, loading, error } = useQuery(GET_ALL_PERMISSIONS);
  const [createVendor] = useMutation(CREATE_VENDOR);
  const [updateVendor] = useMutation(UPDATE_VENDOR);

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: vendorByID, refetch } = useQuery(VENDOR_BY_ID, {
    variables: { vendorId: id },
    skip: !id,
  });

  useEffect(() => {
    if (vendorByID) {
      setFormData({
        name: vendorByID?.vendorById?.name ?? "",
        businessType: vendorByID?.vendorById?.businessType ?? "",
        email: vendorByID?.vendorById?.email ?? "",
        address: vendorByID?.vendorById?.address ?? "",
        contactNumber: vendorByID?.vendorById?.contactNumber ?? "",
        password: "",
        confirmPassword: "",
        allowedPermissions: vendorByID?.vendorById?.permissions ?? [],
      });
    }
  }, [vendorByID]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handlePermissionChange = (permissionId: string, isAllowed: boolean) => {
    setFormData((prevState) => {
      const updatedPermissions = isAllowed
        ? [...prevState.allowedPermissions, permissionId]
        : prevState.allowedPermissions.filter((id) => id !== permissionId);

      return {
        ...prevState,
        allowedPermissions: updatedPermissions,
      };
    });
  };

  let groupedPermissions = {};
  if (allPermissions && allPermissions.permissions) {
    groupedPermissions = allPermissions.permissions.reduce((acc: any, permission: any) => {
      const { module } = permission;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {});
  }


  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeTab < 1 && !id) {
      setActiveTab((prev) => prev + 1);
    }
  };

  const handleSave = async () => {
    if (id) {
      setErrors({});
      try {
        await vendorSchema.validate(formData, { abortEarly: false });
      } catch (error) {
        if (error.inner) {
          const validationErrors: { [key: string]: string } = error.inner.reduce(
            (acc: any, error: any) => {
              acc[error.path] = error.message;
              return acc;
            },
            {}
          );
          setErrors(validationErrors)
          return;
        }
        return
      }
      const { data } = await updateVendor({
        variables: {
          updateVendorId: id,
          input: {
            address: formData.address,
            businessType: formData.businessType,
            contactNumber: formData.contactNumber,
            email: formData.email,
            name: formData.name,
          },
          password: formData.password,
          permissions: formData.allowedPermissions,
        },
      });

      if (data) {
        toast.success("Vendor Updated successfully");
        refetch();
      }
    } else {
      setErrors({});
      try {
        await vendorSchema.validate(formData, { abortEarly: false });
      } catch (error) {
        if (error.inner) {
          const validationErrors: { [key: string]: string } = error.inner.reduce(
            (acc: any, error: any) => {
              acc[error.path] = error.message;
              return acc;
            },
            {}
          );
          setErrors(validationErrors)
          return;
        }
        return
      }
      const { data } = await createVendor({
        variables: {
          input: {
            address: formData.address,
            businessType: formData.businessType,
            contactNumber: formData.contactNumber,
            email: formData.email,
            name: formData.name,
          },
          password: formData.password,
          permissions: formData.allowedPermissions,
        },
      });

      if (data) {
        toast.success("Vendor created successfully");
        setFormData({
          name: "",
          businessType: "",
          email: "",
          address: "",
          contactNumber: "",
          password: "",
          confirmPassword: "",
          allowedPermissions: [],
        });
      }
    }
  };

  return (
    <Fragment>
      <CommonBreadcrumb title={t("vendors.create_vendor.addVendor")} parent={t("vendors.create_vendor.vendors")} />
      <Container fluid>
        <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
          <TabList className="nav nav-tabs tab-coupon">
            <Tab className="nav-link">{t("vendors.create_vendor.account")}</Tab>
            <Tab className="nav-link">{t("vendors.create_vendor.permission")}</Tab>
          </TabList>

          <TabPanel>
            <Form className="needs-validation user-add">
              <h4>{t("vendors.create_vendor.accountDetails")}</h4>
              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* {t("vendors.create_vendor.name")}</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && <div className="errorMsg">{errors.name}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* {t("vendors.create_vendor.businessType")}</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="businessType"
                      type="select"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                    >
                      <option value="" disabled>
                        {t("vendors.create_vendor.selectType")}
                      </option>
                      <option value="Physical">{t("vendors.create_vendor.physical")}</option>
                      <option value="Digital">{t("vendors.create_vendor.digital")}</option>
                    </Input>
                    {errors.businessType && <div className="errorMsg">{errors.businessType}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* {t("vendors.create_vendor.address")}</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    {errors.address && <div className="errorMsg">{errors.address}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* {t("vendors.create_vendor.contactNumber")}</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="contactNumber"
                      type="text"
                      required
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      max="10"
                    />
                    {errors.contactNumber && <div className="errorMsg">{errors.contactNumber}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* {t("vendors.create_vendor.email")}</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {errors.email && <div className="errorMsg">{errors.email}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* {t("vendors.create_vendor.password")}</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    {errors.password && <div className="errorMsg">{errors.password}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* {t("vendors.create_vendor.confirmPassword")}</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    {errors.confirmPassword && <div className="errorMsg">{errors.confirmPassword}</div>}
                  </Col>
                </Row>
              </FormGroup>
            </Form>
          </TabPanel>

          <TabPanel>
            <Form className="needs-validation user-add" noValidate>
              {loading ? (
                <div className="text-center">
                  <Spinner style={{ color: '#ff8084' }} />
                </div>
              ) : error ? (
                <p>{t("vendors.create_vendor.errorLoadingPermissions")}: {error.message}</p>
              ) : (
                <div className="permission-block">
                  {Object.entries(groupedPermissions).map(([moduleName, permissions]: any) => (
                    <div key={moduleName} className="attribute-blocks">
                      <h5 className="f-w-600 mb-3">{`${moduleName} Permissions`}</h5>
                      {permissions.map((permission: any) => (
                        <Row key={permission.id} className="mb-3">
                          <Col xl="3" sm="4">
                            <Label className="form-label">{permission.name}</Label>
                          </Col>
                          <Col xl="9" sm="8">
                            <FormGroup className="m-checkbox-inline mb-0 custom-radio-ml d-flex radio-animated">
                              <Label className="d-block">
                                <Input
                                  className="radio_animated"
                                  id={`allow-${permission.id}`}
                                  type="radio"
                                  checked={formData.allowedPermissions.includes(permission.id)}
                                  name={`permission-${permission.id}`}
                                  onChange={() => handlePermissionChange(permission.id, true)}
                                />
                                {t("vendors.create_vendor.allow")}
                              </Label>
                              <Label className="d-block">
                                <Input
                                  className="radio_animated"
                                  id={`deny-${permission.id}`}
                                  type="radio"
                                  checked={!formData.allowedPermissions.includes(permission.id)}
                                  name={`permission-${permission.id}`}
                                  onChange={() => handlePermissionChange(permission.id, false)}
                                />
                                {t("vendors.create_vendor.deny")}
                              </Label>
                            </FormGroup>
                          </Col>
                        </Row>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </Form>
          </TabPanel>
        </Tabs>

        {/* Form Actions */}
        <div className="text-end">
          <Button
            color="primary"
            className="px-5"
            onClick={handleSave}
          >
            {id ? t("vendors.create_vendor.updateVendor") : t("vendors.create_vendor.saveVendor")}
          </Button>
        </div>
      </Container>
    </Fragment>
  );
};

export default CreateVendors;
