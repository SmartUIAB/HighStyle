import React, { useState } from "react";
import CommonLayout from "../../../../components/shop/common-layout";
import { Input, Container, Row, Form, Label, Col, Button } from "reactstrap";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "../../../../GraphQL/Mutations/authMutations";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";

const Register = () => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [createCustomer] = useMutation(REGISTER_USER);
  const router = useRouter();
  const { t } = useTranslation();

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fname.trim()) newErrors.fname = t("register.error.firstName");
    if (!formData.lname.trim()) newErrors.lname = t("register.error.lastName");
    if (!formData.email.trim()) {
      newErrors.email = t("register.error.email");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("register.error.emailInvalid");
    }
    if (!formData.password.trim()) {
      newErrors.password = t("register.error.password");
    } else if (formData.password.length < 6) {
      newErrors.password = t("register.error.passwordLength");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { data } = await createCustomer({
        variables: {
          input: {
            email: formData.email,
            firstname: formData.fname,
            lastname: formData.lname,
          },
          password: formData.password,
        },
      });

      if (data) {
        toast.success(t("register.successMessage"));
        router.replace("/");
      }
    } catch (error) {
      toast.error(t("register.errorMessage"));
    }
  };

  return (
    <CommonLayout parent={t("route_name.home")} title={t("register.title")}>
      <section className="register-page section-b-space">
        <Container>
          <Row>
            <Col lg="12">
              <h3>{t("register.title")}</h3>
              <div className="theme-card">
                <Form className="theme-form" onSubmit={handleSubmit}>
                  <Row>
                    <Col md="6">
                      <Label className="form-label" for="fname">
                        {t("register.firstName")}
                      </Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="fname"
                        placeholder={t("register.firstName")}
                        required
                        value={formData.fname}
                        onChange={handleChange}
                      />
                      {errors.fname && (
                        <p className="text-danger">{errors.fname}</p>
                      )}
                    </Col>
                    <Col md="6">
                      <Label className="form-label" for="lname">
                        {t("register.lastName")}
                      </Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="lname"
                        placeholder={t("register.lastName")}
                        required
                        value={formData.lname}
                        onChange={handleChange}
                      />
                      {errors.lname && (
                        <p className="text-danger">{errors.lname}</p>
                      )}
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <Label className="form-label" for="email">
                        {t("register.email")}
                      </Label>
                      <Input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder={t("register.email")}
                        required
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && (
                        <p className="text-danger">{errors.email}</p>
                      )}
                    </Col>
                    <Col md="6">
                      <Label className="form-label" for="password">
                        {t("register.password")}
                      </Label>
                      <Input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder={t("register.password")}
                        required
                        value={formData.password}
                        onChange={handleChange}
                      />
                      {errors.password && (
                        <p className="text-danger">{errors.password}</p>
                      )}
                    </Col>
                    <Col md="12">
                      <Button type="submit" className="btn btn-solid w-auto">
                        {t("register.createAccount")}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </CommonLayout>
  );
};

export default Register;
