import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/studio") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  const hasLocale = (locales as readonly string[]).some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) {
    // Forward the pathname as a REQUEST header so server components
    // (TrainingHighlightBand, not-found boundaries) can read it via
    // headers(); the response copy is kept for parity.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("x-pathname", pathname);
    return res;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|studio|.*\\..*).*)"],
};
