import { NextRequest, NextResponse } from "next/server";

const PROTECTED = [
  "/dashboard",
  "/trades",
  "/journal",
  "/analytics",
  "/accounts",
  "/calendar",
  "/ea",
  "/settings",
  "/billing",
];

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("zenith_token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|webp|css|js|woff2?)).*)",
    "/(api|trpc)(.*)",
  ],
};
