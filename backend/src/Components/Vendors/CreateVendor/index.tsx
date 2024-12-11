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

  const [errors, setErrors] = useState<ErrorData>({
    name: "",
    businessType: "",
    email: "",
    address: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

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

  const validateForm = (): boolean => {
    const newErrors: Partial<ErrorData> = {};
    let isValid = true;

    if (!formData.name) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.businessType) {
      newErrors.businessType = "Business Type is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    }

    if (!formData.address) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact Number is required";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors as ErrorData);
    return isValid;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateForm() && activeTab < 1 && !id) {
      setActiveTab((prev) => prev + 1);
    }
  };

  const handleSave = async () => {
    if (id) {
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
      <CommonBreadcrumb title="Add Vendor" parent="Vendors" />
      <Container fluid>
        <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
          <TabList className="nav nav-tabs tab-coupon">
            <Tab className="nav-link">Account</Tab>
            <Tab className="nav-link">Permission</Tab>
          </TabList>

          <TabPanel>
            <Form className="needs-validation user-add">
              <h4>Account Details</h4>
              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* Name</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      invalid={!!errors.name}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* Business Type</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="businessType"
                      type="select"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      invalid={!!errors.businessType}
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      <option value="Physical">Physical</option>
                      <option value="Digital">Digital</option>
                    </Input>
                    {errors.businessType && <div className="invalid-feedback">{errors.businessType}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* Address</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      invalid={!!errors.address}
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* Contact Number</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="contactNumber"
                      type="text"
                      required
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      invalid={!!errors.contactNumber}
                      max="10"
                    />
                    {errors.contactNumber && <div className="invalid-feedback">{errors.contactNumber}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* Email</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      invalid={!!errors.email}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* Password</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      invalid={!!errors.password}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </Col>
                </Row>
              </FormGroup>

              <FormGroup>
                <Row>
                  <Col xl="3" md="4">
                    <Label>* Confirm Password</Label>
                  </Col>
                  <Col xl="8" md="7">
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      invalid={!!errors.confirmPassword}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
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
                <p>Error loading permissions: {error.message}</p>
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
                                Allow
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
                                Deny
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
            {id ? "Update Vendor" : "Save Vendor"}
          </Button>
        </div>
      </Container>
    </Fragment>
  );
};

export default CreateVendors;
