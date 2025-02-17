import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const supportedLocales = ["en", "es", "fr", 'pt'];

export function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;
  const token = request.cookies.get("token");
  const locale = pathname.split('/')[1];

  if (pathname.includes("/assets/") || pathname.includes("/public/") || pathname.includes("/i18n/")) {
    return NextResponse.next();
  }

  if (!supportedLocales.includes(locale)) {
    const defaultLocale = "en";
    return NextResponse.redirect(`${origin}/${defaultLocale}${pathname}${search}`);
  }


  if (pathname === `/${locale}/page/account/login` || pathname === `/${locale}/page/account/register` || pathname === `/${locale}`) {
    return NextResponse.next();
  }

  // if (
  //   !token &&
  //   pathname !== `/${locale}/page/account/forget-pwd` &&
  //   !pathname.startsWith(`/${locale}/page/account/password-reset/`)
  // ) {
  //   return NextResponse.redirect(`${origin}/${locale}/page/account/login`);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
