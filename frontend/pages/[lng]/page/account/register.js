import React, { useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import CommonLayout from "../../../../components/shop/common-layout";
import LocalLink from "../../../../components/LocalLink";
import Icon from "../../../../components/storefront/Icon";
import useStoreText from "../../../../components/storefront/useStoreText";
import { safeReturnPath } from "../../../../components/storefront/commerce.mjs";
import { REGISTER_USER } from "../../../../GraphQL/Mutations/authMutations";

export default function Register() {
  const { text, locale } = useStoreText();
  const router = useRouter();
  const [form, setForm] = useState({ firstname: "", lastname: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [createCustomer, { loading }] = useMutation(REGISTER_USER);
  const pending = useRef(false);
  const returnTo = safeReturnPath(router.query.returnTo, locale);
  const field = (name, label, autoComplete, type = "text") => <label className="hs-field"><span>{text(label)}</span><input name={name} type={type} autoComplete={autoComplete} value={form[name]} onChange={event => setForm(previous => ({ ...previous, [name]: event.target.value }))} required minLength={name === "password" ? 10 : 1} maxLength={name === "email" ? 254 : name === "password" ? 128 : 100} aria-describedby={name === "password" ? "password-hint" : undefined} /></label>;
  const submit = async event => {
    event.preventDefault();
    if (pending.current) return;
    if (form.password.length < 10) { setError(text("passwordShort")); return; }
    if (!form.firstname.trim() || !form.lastname.trim()) { setError(text("required")); return; }
    pending.current = true;
    setError("");
    try {
      await createCustomer({ variables: { input: { firstname: form.firstname.trim(), lastname: form.lastname.trim(), email: form.email.trim() }, password: form.password } });
      await router.replace({ pathname: `/${locale}/page/account/login`, query: { registered: "1", returnTo } });
    } catch (_) { setError(text("registerError")); }
    finally { pending.current = false; }
  };
  return <CommonLayout title={text("createAccount")}><section className="hs-container hs-page-space hs-auth"><div className="hs-page-heading"><span className="hs-eyebrow">HIGHSTYLE / {text("account")}</span><h1>{text("createTitle")}</h1><p>{text("createBody")}</p></div><div className="hs-card">{error && <p className="hs-notice hs-notice-error" role="alert">{error}</p>}<form onSubmit={submit} aria-busy={loading} data-testid="register-form"><div className="hs-form-grid">{field("firstname", "firstName", "given-name")}{field("lastname", "lastName", "family-name")}</div>{field("email", "email", "email", "email")}{field("password", "password", "new-password", "password")}<p id="password-hint" className="hs-small">{text("passwordHint")}</p><button type="submit" className="hs-button hs-button-wide" disabled={loading}>{text(loading ? "creating" : "createAccount")}<Icon name="arrow" size={18} /></button></form></div><p className="hs-auth-alternate">{text("haveAccount")} <LocalLink href={`/page/account/login?returnTo=${encodeURIComponent(returnTo)}`}>{text("signIn")}</LocalLink></p></section></CommonLayout>;
}
