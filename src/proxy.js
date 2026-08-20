import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
//proxy and getcurrentuser almost same but proxy runs frist even before homepage thast why it protects homepage and redirects straight to login
export async function proxy(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/", "/profile/:path*"], //protected routes
};