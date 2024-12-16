import React, { useState } from "react";
import CommonLayout from "../../../components/shop/common-layout";
import { Input, Container, Row, Form, Label, Col, Button } from "reactstrap";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "../../../GraphQL/Mutations/authMutations";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const Register = () => {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [craeteCustomer] = useMutation(REGISTER_USER);
  const router = useRouter();

  // Handle input changes
  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fname.trim()) newErrors.fname = "First Name is required";
    if (!formData.lname.trim()) newErrors.lname = "Last Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is not valid";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const { data } = await craeteCustomer({
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
        toast.success("Customer Created Successfully");
        router.replace("/");
      }
    } catch (error) {
      toast.error("An error occurred while creating the account");
    }
  };

  return (
    <CommonLayout parent="home" title="register">
      <section className="register-page section-b-space">
        <Container>
          <Row>
            <Col lg="12">
              <h3>Create Account</h3>
              <div className="theme-card">
                <Form className="theme-form" onSubmit={handleSubmit}>
                  <Row>
                    <Col md="6">
                      <Label className="form-label" for="fname">
                        First Name
                      </Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="fname"
                        placeholder="First Name"
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
                        Last Name
                      </Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="lname"
                        placeholder="Last Name"
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
                        Email
                      </Label>
                      <Input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Email"
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
                        Password
                      </Label>
                      <Input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter your password"
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
                        Create Account
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
