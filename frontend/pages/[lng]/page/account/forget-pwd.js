import React, { useState } from "react";
import CommonLayout from "../../../../components/shop/common-layout";
import { Container, Row, Form, Input, Col, Button } from "reactstrap";
import { useMutation } from "@apollo/client";
import { FORGET_PASSWORD } from "../../../../GraphQL/Mutations/authMutations";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next"; // Import useTranslation hook

const ForgetPwd = () => {
  const [email, setEmail] = useState("");
  const [forgetPasswordMutation] = useMutation(FORGET_PASSWORD);
  const { t } = useTranslation(); // Initialize the useTranslation hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgetPasswordMutation({
        variables: { email },
      });
      console.log("Response:", response);
      toast.success(t("forgetPassword.successMessage")); // Use translation for success message
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("forgetPassword.errorMessage")); // Use translation for error message
    }
  };

  return (
    <CommonLayout
      parent={t("route_name.home")}
      title={t("forgetPassword.forgetPassword")}
    >
      <section className="pwd-page section-b-space">
        <Container>
          <Row>
            <Col lg="6" className="m-auto">
              <h2>{t("forgetPassword.title")}</h2>
              <Form className="theme-form" onSubmit={handleSubmit}>
                <Row>
                  <Col md="12">
                    <Input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder={t("forgetPassword.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Col>
                  <Col md="12" className="text-center mt-3">
                    <Button type="submit" className="btn btn-solid w-auto">
                      {t("forgetPassword.submitButton")}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>
    </CommonLayout>
  );
};

export default ForgetPwd;
