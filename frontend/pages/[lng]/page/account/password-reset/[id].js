import React, { useState } from "react";
import CommonLayout from "../../../../../components/shop/common-layout";
import { Container, Row, Form, Input, Col, Button } from "reactstrap";
import { useMutation } from "@apollo/client";
import { RESET_PASSWORD } from "../../../../../GraphQL/Mutations/authMutations";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const PasswordReset = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetPassword] = useMutation(RESET_PASSWORD);
  const router = useRouter();
  const { id } = router.query || {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
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
      toast.success("Password reset successful.");
      router.push("/page/account/login");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to reset password. Please try again.");
    }
  };

  return (
    <CommonLayout parent="home" title="Reset Password">
      <section className="pwd-page section-b-space">
        <Container>
          <Row>
            <Col lg="6" className="m-auto">
              <h2>Reset Your Password</h2>
              <Form className="theme-form" onSubmit={handleSubmit}>
                <Row>
                  <Col md="12">
                    <Input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Enter New Password"
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
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Col>
                  <Col md="12" className="text-center mt-4">
                    <Button type="submit" className="btn btn-solid w-auto">
                      Reset Password
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
