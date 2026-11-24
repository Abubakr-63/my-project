import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function refreshAdminSession(
  request: NextRequest,
  routeLocale: (request: NextRequest) => NextResponse,
) {
  const writes: Parameters<SetAllCookies>[0] = [];
  const refreshHeaders = new Headers();
  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient<Database>(url, anonKey, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production" },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
          writes.push(cookie);
        }
        for (const [name, value] of Object.entries(headers)) refreshHeaders.set(name, value);
      },
    },
  });

  await supabase.auth.getUser();
  // Run locale routing with the updated request so its rewrite also forwards the new cookies.
  const response = routeLocale(request);
  for (const { name, value, options } of writes) response.cookies.set(name, value, options);
  refreshHeaders.forEach((value, name) => response.headers.set(name, value));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
