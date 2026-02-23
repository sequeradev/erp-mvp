import type { NextRequest } from "next/server";

const PLACEHOLDER_COOKIE = "erp_session";

export function isAuthenticated(request: NextRequest) {
  return request.cookies.get(PLACEHOLDER_COOKIE)?.value === "1";
}

export { PLACEHOLDER_COOKIE };
