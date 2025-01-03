import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const supportedLocales = ["en", "es", "fr", 'pt'];

export function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;
  const token = request.cookies.get("token");
  const locale = pathname.split('/')[1];



  // Skip locale logic for paths containing "assets" or "public"
  if (pathname.includes("/assets/") || pathname.includes("/public/") || pathname.includes("/i18n/")) {
    return NextResponse.next();
  }

  // If no locale, redirect to default locale
  if (!supportedLocales.includes(locale)) {
    const defaultLocale = "en";
    console.log("-=-=--...........")
    return NextResponse.redirect(`${origin}/${defaultLocale}${pathname}${search}`);
  }


  // Handle paths like "/page/account/login"
  if (pathname === `/${locale}/page/account/login` || pathname === `/${locale}/page/account/register`) {
    // If not authenticated, allow access to login
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    return NextResponse.redirect(`${origin}/${locale}/page/account/login`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
