import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value

  const protectedPaths = [
    "/dashboard",
    "/rentals",
    "/properties",
    "/expenses"
  ]

  const attemptedPath = req.nextUrl.pathname

  const isProtected = protectedPaths.some((path) =>
    attemptedPath.startsWith(path)
  )

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}