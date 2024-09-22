import  { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server"; 

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (token) {
    if (
      url.pathname === "/sign-in") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

  } else {
    // Redirect unauthenticated users away from protected pages
    if (url.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

  }

  if (!token && (url.pathname.startsWith("/dashboard"))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths"
export const config = {
  matcher: ["/sign-in", "/dashboard/"],
};
