import { Href } from "@/Constants";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import SocialMediaIcons from "./SocialMediaIcons";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { REGISTER_USER } from "../../../GraphQL/Mutations/authMutations";
import { useAppSelector } from "@/Redux/Hooks";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [register] = useMutation(REGISTER_USER);
  const [loading, setLoading] = useState(false);
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      toast.error("You must agree to the terms and conditions");
      setLoading(false);
      return;
    }

    try {
      const { data } = await register({
        variables: {
          input: {
            email,
            password,
          },
        },
      });
      localStorage.setItem("userDetail", JSON.stringify(data.register.user));
      toast.success("Registration successful!");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      router.push(`/${i18LangStatus}/dashboard`);
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form className="form-horizontal auth-form" onSubmit={handleSubmit}>
      <FormGroup>
        <Input
          required
          name="email"
          type="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-required="true"
        />
      </FormGroup>
      <FormGroup>
        <Input
          required
          name="login[password]"
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Input
          required
          name="login[password]"
          type="password"
          className="form-control"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </FormGroup>
      <div className="form-terms">
        <div className="custom-control custom-checkbox me-sm-2">
          <Label className="d-block">
            <Input
              className="checkbox_animated"
              id="chk-ani2"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            I agree all statements in{" "}
            <span>
              <a href={Href}>Terms &amp; Conditions</a>
            </span>
          </Label>
        </div>
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
