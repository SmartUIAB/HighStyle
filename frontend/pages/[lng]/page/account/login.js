import React, { useRef, useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import CommonLayout from "../../../../components/shop/common-layout";
import LocalLink from "../../../../components/LocalLink";
import Icon from "../../../../components/storefront/Icon";
import useStoreText from "../../../../components/storefront/useStoreText";
import useFormReady from "../../../../components/storefront/useFormReady";
import { safeReturnPath } from "../../../../components/storefront/commerce.mjs";
import { CUSTOMER_CHANGED } from "../../../../components/storefront/useCustomer";
import { LOGIN_USER } from "../../../../GraphQL/Mutations/authMutations";

export default function Login() {
  const { text, locale } = useStoreText();
  const router = useRouter();
  const ready = useFormReady(router.isReady);
  const client = useApolloClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { loading }] = useMutation(LOGIN_USER);
  const pending = useRef(false);
  const returnTo = safeReturnPath(router.query.returnTo, locale);
  const submit = async event => {
    event.preventDefault();
    if (!ready || pending.current) return;
    pending.current = true;
    setError("");
    try {
      const { data } = await login({ variables: { email: email.trim(), password } });
      if (!data?.loginCustomer?.customer?.id) throw new Error("Missing customer");
      await client.clearStore();
      localStorage.setItem("customerDetail", JSON.stringify(data.loginCustomer.customer));
      sessionStorage.removeItem("highstyle:delivery");
      window.dispatchEvent(new Event(CUSTOMER_CHANGED));
      await router.replace(returnTo);
    } catch (_) { setError(text("loginError")); }
    finally { pending.current = false; }
  };
  return <CommonLayout title={text("signIn")}><section className="hs-container hs-page-space hs-auth"><div className="hs-page-heading"><span className="hs-eyebrow">HIGHSTYLE / {text("account")}</span><h1>{text("welcome")}</h1><p>{text("welcomeBody")}</p></div>
    <div className="hs-card">{router.query.registered === "1" && <p className="hs-notice hs-notice-success" role="status">{text("registered")}</p>}{error && <p className="hs-notice hs-notice-error" role="alert">{error}</p>}<form method="post" onSubmit={submit} aria-busy={!ready || loading} data-ready={ready} data-testid="login-form"><label className="hs-field"><span>{text("email")}</span><input type="email" name="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} disabled={!ready || loading} /></label><label className="hs-field"><span>{text("password")}</span><input type="password" name="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required maxLength={128} disabled={!ready || loading} /></label><LocalLink href="/page/account/forget-pwd" className="hs-text-button">{text("forgot")}</LocalLink><button type="submit" className="hs-button hs-button-wide" disabled={!ready || loading}>{text(loading ? "loggingIn" : "signIn")}<Icon name="arrow" size={18} /></button></form></div>
    <p className="hs-auth-alternate">{text("newHere")} <LocalLink href={`/page/account/register?returnTo=${encodeURIComponent(returnTo)}`}>{text("createAccount")}</LocalLink></p>
  </section></CommonLayout>;
}
