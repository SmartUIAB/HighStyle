import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token");

  if (path === "/auth/login") {
    return NextResponse.next();
  }

  if (!token && !path.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (token && path.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/en/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
