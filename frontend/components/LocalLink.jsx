import Link from "next/link";
import { useRouter } from "next/router";
import { localizedPath } from "./storefront/commerce.mjs";

export default function LocalLink({ href = "/", children, ...props }) {
  const router = useRouter();
  return <Link href={localizedPath(href, router.query.lng)} {...props}>{children}</Link>;
}
