import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionCookie } from "@/lib/adminAuth";

/**
 * Auth gate for the admin surface — SPEC-CHATBOT §8.
 *
 * Guards `/study` and `/api/admin/*`; the login form and the login route are
 * exempt, or there would be no way in.
 *
 * §11 item 5 — the matcher lists only these two prefixes, so middleware never
 * runs for `/_next/*`, images, or any other static asset. There is nothing to
 * exclude because nothing else is included.
 */

const LOGIN_PAGE = "/study/login";
const LOGIN_API = "/api/admin/login";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === LOGIN_PAGE || pathname === LOGIN_API) {
    return NextResponse.next();
  }

  // Read at request time. The build must succeed with zero env vars (§2), so a
  // missing secret is a runtime failure, not a build one — and it fails closed.
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (secret === undefined || secret.trim() === "") {
    console.error("[middleware] ADMIN_COOKIE_SECRET is not set; denying access");
    return pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Admin auth is not configured." }, { status: 500 })
      : NextResponse.redirect(new URL(LOGIN_PAGE, request.url));
  }

  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (await isValidSessionCookie(cookie, secret)) {
    return NextResponse.next();
  }

  // API callers get a status they can act on; browsers get the login form.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const login = new URL(LOGIN_PAGE, request.url);
  if (pathname !== "/study") {
    login.searchParams.set("next", pathname + search);
  }
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/study", "/study/:path*", "/api/admin/:path*"],
};
