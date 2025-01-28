import React, { useState } from "react";
import CommonLayout from "../../../../components/shop/common-layout";
import { Container, Row, Form, Input, Col, Button } from "reactstrap";
import { useMutation } from "@apollo/client";
import { FORGET_PASSWORD } from "../../../../GraphQL/Mutations/authMutations";
import { toast } from "react-toastify";

const ForgetPwd = () => {
  const [email, setEmail] = useState("");
  const [forgetPassword] = useMutation(FORGET_PASSWORD);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgetPassword({
        variables: { email },
      });
      console.log("Response:", response);
      toast.success("Password reset link sent to your email.");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send reset link. Please try again.");
    }
  };

  return (
    <CommonLayout parent="home" title="Forget Password">
      <section className="pwd-page section-b-space">
        <Container>
          <Row>
            <Col lg="6" className="m-auto">
              <h2>Forget Your Password</h2>
              <Form className="theme-form" onSubmit={handleSubmit}>
                <Row>
                  <Col md="12">
                    <Input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Enter Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Col>
                  <Col md="12" className="text-center mt-3">
                    <Button type="submit" className="btn btn-solid w-auto">
                      Submit
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
