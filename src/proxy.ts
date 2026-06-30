import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = [
  "/login",
  "/register",
  "/api/auth",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )

  if (isPublic) {
    return NextResponse.next()
  }

  const token = request.cookies.get("next-auth.session-token")
    ?? request.cookies.get("__Secure-next-auth.session-token")
    ?? request.cookies.get("authjs.session-token")

  if (pathname.startsWith("/api/") && !token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  if (!pathname.startsWith("/api/") && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
