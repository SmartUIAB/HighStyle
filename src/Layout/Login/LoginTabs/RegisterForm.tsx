import { Href } from "@/Constants";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import SocialMediaIcons from "./SocialMediaIcons";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { REGISTER_USER } from "../../../GraphQL/Mutations/authMutations";
import { useAppSelector } from "@/Redux/Hooks";
import { registerSchema } from "../../../utils/validation";

const RegisterForm = () => {
  const [register] = useMutation(REGISTER_USER);
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await registerSchema.validate(formValues, { abortEarly: false });

      const { data } = await register({
        variables: {
          input: {
            email: formValues.email,
            password: formValues.password,
            firstname: formValues.firstName,
            lastname: formValues.lastName,
            company: formValues.company,
          },
        },
      });

      localStorage.setItem("userDetail", JSON.stringify(data.register.user));
      toast.success("Registration successful!");

      setFormValues({
        firstName: "",
        lastName: "",
        company: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
      });

      router.push("/auth/login");
    } catch (err: any) {
      if (err.inner) {
        const validationErrors: { [key: string]: string } = err.inner.reduce(
          (acc: any, error: any) => {
            acc[error.path] = error.message;
            return acc;
          },
          {}
        );
        setErrors(validationErrors);
      } else {
        toast.error(err.message || "An error occurred during registration");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form className="form-horizontal auth-form" onSubmit={handleSubmit}>
      <FormGroup>
        <Input
          required
          name="firstName"
          type="text"
          className="form-control"
          placeholder="First Name"
          value={formValues.firstName}
          onChange={handleChange}
        />
        {errors.firstName && <div className="errorMsg">{errors.firstName}</div>}
      </FormGroup>

      <FormGroup>
        <Input
          required
          name="lastName"
          type="text"
          className="form-control"
          placeholder="Last Name"
          value={formValues.lastName}
          onChange={handleChange}
        />
        {errors.lastName && <div className="errorMsg">{errors.lastName}</div>}
      </FormGroup>

      <FormGroup>
        <Input
          required
          name="company"
          type="text"
          className="form-control"
          placeholder="Company"
          value={formValues.company}
          onChange={handleChange}
        />
        {errors.company && <div className="errorMsg">{errors.company}</div>}
      </FormGroup>

      <FormGroup>
        <Input
          required
          name="email"
          type="email"
          className="form-control"
          placeholder="Email"
          value={formValues.email}
          onChange={handleChange}
        />
        {errors.email && <div className="errorMsg">{errors.email}</div>}
      </FormGroup>

      <FormGroup>
        <Input
          required
          name="password"
          type="password"
          className="form-control"
          placeholder="Password"
          value={formValues.password}
          onChange={handleChange}
        />
        {errors.password && <div className="errorMsg">{errors.password}</div>}
      </FormGroup>

      <FormGroup>
        <Input
          required
          name="confirmPassword"
          type="password"
          className="form-control"
          placeholder="Confirm Password"
          value={formValues.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <div className="errorMsg">{errors.confirmPassword}</div>}
      </FormGroup>

      <div className="form-terms">
        <div className="custom-control custom-checkbox me-sm-2">
          <Label className="d-block">
            <Input
              className="checkbox_animated"
              id="chk-ani2"
              type="checkbox"
              name="agreeTerms"
              checked={formValues.agreeTerms}
              onChange={handleChange}
            />
            I agree to the{" "}
            <span>
              <a href={Href}>Terms &amp; Conditions</a>
            </span>
          </Label>
        </div>
        {errors.agreeTerms && <div className="errorMsg">{errors.agreeTerms}</div>}
      </div>

      <div className="form-button">
        <Button color="primary" type="submit" disabled={loading}>
          {loading ? <div className="loader"></div> : "Register"}
        </Button>
      </div>

      <div className="form-footer">
        <span>Or Sign up with social platforms</span>
        <SocialMediaIcons />
      </div>
    </Form>
  );
};

export default RegisterForm;
