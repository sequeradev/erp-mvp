"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PLACEHOLDER_COOKIE } from "@/lib/route-protection";

export async function createPlaceholderSession(formData: FormData) {
  const from = formData.get("from");
  const fromPath = typeof from === "string" && from.startsWith("/") ? from : "/dashboard";

  const cookieStore = await cookies();
  cookieStore.set(PLACEHOLDER_COOKIE, "1", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect(fromPath);
}
