import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login"];

function hasSupabaseSession(request: NextRequest) {
  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name);

  return cookieNames.some(
    (name) =>
      name.startsWith("sb-") ||
      name.includes("supabase") ||
      name.includes("auth-token")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isLoggedIn = hasSupabaseSession(request);

  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/clientes/:path*",
    "/servicos/:path*",
    "/agenda/:path*",
    "/reservas/:path*",
    "/meu-app/:path*",
  ],
};