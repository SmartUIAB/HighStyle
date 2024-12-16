import { useAppSelector } from "@/Redux/Hooks";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { Eye, EyeOff } from "react-feather";
import { toast } from "react-toastify";
import {
  Button,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
} from "reactstrap";
import SocialMediaIcons from "./SocialMediaIcons";
import { LOGIN_USER } from "@/GraphQL/Mutations/authMutations";
import { useMutation } from "@apollo/client";

const LoginForm = () => {
  const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
  const [login, { loading }] = useMutation(LOGIN_USER);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassWord, setShowPassWord] = useState(true);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formValues;
  const router = useRouter();

  const handleUserValue = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  };

  const formSubmitHandle = async (event: FormEvent) => {
    event.preventDefault();

    if (email !== "" && password !== "") {
      try {
        const { data } = await login({
          variables: {
            email,
            password,
            rememberMe,
          },
        });

        const moduleWisePermissions = data.login.user.permissions.reduce(
          (acc:any, permission:any) => {
            const { module } = permission;
            if (!acc[module]) {
              acc[module] = [];
            }
            acc[module].push(permission);
            return acc;
          },
          {}
        );

        const userData = {
          ...data.login.user,
          permissions: moduleWisePermissions,
        };

        await Promise.all([
          localStorage.setItem("userDetail", JSON.stringify(userData)),
          toast.success("Login successful"),
        ]);

        console.log(`/${i18LangStatus}/dashboard`);
        router.replace(`/${i18LangStatus}/dashboard`);
      } catch (error) {
        toast.error(error.message || "An error occurred during login");
      }
    } else {
      toast.error("Please enter valid email and password");
    }
  };


  return (
    <Form
      className="form-horizontal auth-form"
      autoComplete="off"
      onSubmit={formSubmitHandle}
    >
      <FormGroup>
        <Label for="exampleInputEmail1">Email</Label>
        <Input
          required
          onChange={handleUserValue}
          type="email"
          name="email"
          value={email}
          placeholder="Email"
          id="exampleInputEmail1"
        />
      </FormGroup>
      <FormGroup>
        <Label for="exampleInputPassword1">Password</Label>
        <InputGroup>
          <Input
            required
            onChange={handleUserValue}
            type={showPassWord ? "text" : "password"}
            name="password"
            value={password}
            placeholder="Password"
            id="exampleInputPassword1"
          />
          <InputGroupText onClick={() => setShowPassWord(!showPassWord)}>
            {showPassWord ? <Eye /> : <EyeOff />}
          </InputGroupText>
        </InputGroup>
      </FormGroup>
      <div className="form-terms">
        <div className="custom-control custom-checkbox me-sm-2">
          <Label className="d-block">
            <Input
              className="checkbox_animated"
              id="chk-ani2"
              type="checkbox"
              onChange={() => setRememberMe(!rememberMe)}
            />
            Remember Me
            <span className="pull-right">
              <Button color="transparent" className="forgot-pass p-0">
                Lost your password?
              </Button>
            </span>
          </Label>
        </div>
      </div>
      <div className="form-button">
        <Button color="primary" type="submit" disabled={loading}>
          {loading ? <div className="loader"></div> : "Login"}
        </Button>
      </div>
      <div className="form-footer">
        <span>Or log in with social platforms</span>
        <SocialMediaIcons />
      </div>
    </Form>
  );
};

export default LoginForm;
