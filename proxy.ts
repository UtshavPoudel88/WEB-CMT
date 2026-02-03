import { NextRequest, NextResponse } from "next/server";

type UserCookie = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

const parseUserCookie = (value?: string): UserCookie | null => {
  if (!value) return null;
  try {
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded) as UserCookie;
  } catch {
    try {
      return JSON.parse(value) as UserCookie;
    } catch {
      return null;
    }
  }
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = parseUserCookie(request.cookies.get("user")?.value);

  if (pathname.startsWith("/admin")) {
    if (!user || user.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = user ? "/" : "/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/user")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};