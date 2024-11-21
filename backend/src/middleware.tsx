import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token");

  // Exclude the login route from authentication checks
  if (path === "/auth/login") {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access non-auth routes to the login page
  if (!token && !path.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect authenticated users trying to access auth routes to the dashboard
  if (token && path.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/en/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all routes except the ones that are static files and favicon
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
