import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isAuthenticated } from "@/lib/route-protection";

export function proxy(request: NextRequest) {
  if (!isAuthenticated(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
