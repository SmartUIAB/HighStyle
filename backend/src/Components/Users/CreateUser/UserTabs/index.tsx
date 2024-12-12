import React, { Fragment, useEffect, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { Form, FormGroup, Input, Label, Row, Col, Button } from "reactstrap";
import AccountDetails from "./AccountDetails";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_PERMISSIONS, USER_BY_ID } from "../../../../GraphQL/Queries/userQueries";
import { CREATE_USER, UPDATE_USER } from "../../../../GraphQL/Mutations/userMutations";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  allowedPermissions: string[];
}

interface Permission {
  id: string;
  name: string;
  module: string;
}

const UserTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    allowedPermissions: []
  });

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: userByID, refetch } = useQuery(USER_BY_ID, {
    variables: { userId: id },
    skip: !id,
  });

  useEffect(() => {
    if (userByID) {
      setFormData({
        firstName: userByID.userById.firstname,
        lastName: userByID.userById.lastname,
        email: userByID.userById.email,
        password: "",
        confirmPassword: "",
        allowedPermissions: userByID.userById.permissions
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        allowedPermissions: []
      })
    }
  }, [userByID]);

  const { data: allPermissions, loading, error } = useQuery(GET_ALL_PERMISSIONS);
  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);

  const handleNext = (e: React.MouseEvent) => {
    console.log(id, "7878787");

    if (validateForm() && id == '') {
      if (activeTab < 1) {
        setActiveTab((prev) => prev + 1);
      }
      e.preventDefault();
    } else {
      if (activeTab < 1) {
        setActiveTab((prev) => prev + 1);
      }
      e.preventDefault();
    }
  };

  const handleSave = async () => {
    try {
      if (id !== null) {
        const { data } = await updateUser({
          variables: {
            userId: id,
            input: {
              email: formData.email,
              firstname: formData.firstName,
              lastname: formData.lastName,
              password: formData.password,
              permissions: formData.allowedPermissions
            }
          }
        });

        if (data) {
          toast.success("User Updated successfully");
        }
      } else {
        const { data } = await createUser({
          variables: {
            input: {
              email: formData.email,
              firstname: formData.firstName,
              lastname: formData.lastName,
              password: formData.password,
              permissions: formData.allowedPermissions
            }
          }
        });

        if (data) {
          toast.success("User created successfully");
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            allowedPermissions: []
          })
          refetch();
        }
      }
    } catch (error) {
      console.error("Error creating user:", error);

      toast.error("Error creating user. Please try again later.");
    }
  };

  const handlePermissionChange = (permissionId: string, isAllowed: boolean) => {
    setFormData((prevState) => {
      const updatedPermissions = isAllowed
        ? [...prevState.allowedPermissions, permissionId]
        : prevState.allowedPermissions.filter((id) => id !== permissionId);

      return {
        ...prevState,
        allowedPermissions: updatedPermissions
      };
    });
  };

  let groupedPermissions: Record<string, Permission[]> = {};
  if (allPermissions && allPermissions.permissions) {
    groupedPermissions = allPermissions.permissions.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
      const { module } = permission;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {});
  }

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    let isValid = true;

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Form submitted successfully!");
    }
  };

  return (
    <Fragment>
      <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
        <TabList className="nav nav-tabs tab-coupon">
          <Tab className="nav-link">Account</Tab>
          <Tab className="nav-link">Permission</Tab>
        </TabList>

        <TabPanel>
          <AccountDetails
            setFormData={setFormData}
            formData={formData}
            handleSubmit={handleSubmit}
            errors={errors}
          />
        </TabPanel>

        <TabPanel>
          <Form className="needs-validation user-add" noValidate>
            {loading ? (
              <p>Loading permissions...</p>
            ) : error ? (
              <p>Error loading permissions: {error.message}</p>
            ) : (
              <div className="permission-block">
                {Object.entries(groupedPermissions).map(([moduleName, permissions]) => (
                  <div key={moduleName} className="attribute-blocks">
                    <h5 className="f-w-600 mb-3">{`${moduleName} Permissions`}</h5>
                    {permissions.map((permission) => (
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

      <div className="pull-right">
        {activeTab < 1 ? (
          <Button color="primary" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button color="primary" onClick={handleSave}>
            Save
          </Button>
        )}
      </div>
    </Fragment>
  );
};

export default UserTabs;
