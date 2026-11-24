import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { refreshAdminSession } from "./lib/admin/refresh-session";
import { routing } from "./lib/routing";

const routeLocale = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const [, locale, segment] = request.nextUrl.pathname.split("/");
  if (segment !== "admin" || !routing.locales.some((value) => value === locale)) {
    return routeLocale(request);
  }

  try {
    return await refreshAdminSession(request, routeLocale);
  } catch {
    const response = routeLocale(request);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/:locale(ru|tg|en)/admin/:path*"],
};
