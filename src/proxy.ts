import createMiddleware from "next-intl/middleware";
import type { NextRequest, NextResponse } from "next/server";
import { refreshAdminSession } from "./lib/admin/refresh-session";
import { locales } from "./lib/locales";
import { routing } from "./lib/routing";

const route = createMiddleware(routing);

function routeLocale(request: NextRequest): NextResponse {
  const response = route(request);
  const links = response.headers.get("Link");
  if (links) {
    response.headers.set("Link", links
      .replace(`hreflang="${locales.tj.routeLocale}"`, `hreflang="${locales.tj.hreflang}"`)
      .replace(/<([^>]+)>; rel="alternate"; hreflang="x-default"/, (_match, href: string) => {
        const url = new URL(href);
        url.pathname = `/${routing.defaultLocale}${url.pathname === "/" ? "" : url.pathname}`;
        return `<${url.href}>; rel="alternate"; hreflang="x-default"`;
      }));
  }
  return response;
}

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
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/:locale(ru|tj|en)/admin/:path*"],
};
