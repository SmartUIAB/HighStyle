import React, { useState } from "react";
import CommonLayout from "../../../../components/shop/common-layout";
import { Container, Row, Form, Label, Input, Col } from "reactstrap";
import { LOGIN_USER } from "../../../../GraphQL/Mutations/authMutations";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import LocalLink from "../../../../components/LocalLink";
import { useTranslation } from "react-i18next";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { t } = useTranslation();

  const [login, { loading }] = useMutation(LOGIN_USER);
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
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
      const { data } = await login({
        variables: {
          email,
          password,
        },
      });

      localStorage.setItem(
        "customerDetail",
        JSON.stringify(data.loginCustomer.customer)
      );
      toast.success("Login successful");
      router.replace("/");
    } catch (error) {
      toast.error(error.message || "An error occurred during login");
    }
  };

  return (
    <CommonLayout parent={t("route_name.home")} title={t("top_header.login")}>
      <section className="login-page section-b-space">
        <Container>
          <Row>
            <Col lg="6">
              <h3>{t("login.welcome")}</h3>
              <div className="theme-card">
                <Form className="theme-form">
                  <div className="form-group">
                    <Label className="form-label" for="email">
                      {t("login.email")}
                    </Label>
                    <Input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {errors.email && (
                      <p className="text-danger">{errors.email}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <Label className="form-label" for="review">
                      {t("login.password")}
                    </Label>
                    <Input
                      type="password"
                      className="form-control"
                      id="review"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    {errors.password && (
                      <p className="text-danger">{errors.password}</p>
                    )}
                  </div>
                  <a onClick={handleSubmit} className="btn btn-solid">
                    {t("login.login_button")}
                  </a>
                </Form>
              </div>
            </Col>
            <Col lg="6" className="right-login">
              <h3> {t("login.new_customer")}</h3>
              <div className="theme-card authentication-right">
                <h6 className="title-font">{t("login.register_button")}</h6>
                <p>{t("login.create_account_description")}</p>
                <LocalLink href="/page/account/register" passHref>
                  <span className="btn btn-solid">
                    {t("login.register_button")}
                  </span>
                </LocalLink>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </CommonLayout>
  );
};

export default Login;
