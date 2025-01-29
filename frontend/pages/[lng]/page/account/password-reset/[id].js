import React, { useState } from "react";
import CommonLayout from "../../../../../components/shop/common-layout";
import { Container, Row, Form, Input, Col, Button } from "reactstrap";
import { useMutation } from "@apollo/client";
import { RESET_PASSWORD } from "../../../../../GraphQL/Mutations/authMutations";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next"; // Import useTranslation hook

const PasswordReset = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetPassword] = useMutation(RESET_PASSWORD);
  const router = useRouter();
  const { id } = router.query || {};
  const { t } = useTranslation(); // Initialize the useTranslation hook

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("passwordReset.passwordsDoNotMatch")); // Localized error message
      return;
    }

    try {
      const response = await resetPassword({
        variables: {
          token: id,
          newPassword: password,
        },
      });
      console.log("Response:", response);
      toast.success(t("passwordReset.successMessage")); // Localized success message
      router.push("/page/account/login");
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("passwordReset.errorMessage")); // Localized error message
    }
  };

  return (
    <CommonLayout
      parent={t("route_name.home")}
      title={t("passwordReset.resetPassword")}
    >
      <section className="pwd-page section-b-space">
        <Container>
          <Row>
            <Col lg="6" className="m-auto">
              <h2>{t("passwordReset.resetYourPassword")}</h2>
              <Form className="theme-form" onSubmit={handleSubmit}>
                <Row>
                  <Col md="12">
                    <Input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder={t("passwordReset.enterNewPassword")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Col>
                  <Col md="12" className="mt-3">
                    <Input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      placeholder={t("passwordReset.confirmNewPassword")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Col>
                  <Col md="12" className="text-center mt-4">
                    <Button type="submit" className="btn btn-solid w-auto">
                      {t("passwordReset.resetPasswordButton")}
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

export default PasswordReset;
