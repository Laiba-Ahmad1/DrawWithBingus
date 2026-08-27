import { NextResponse } from "next/server";

function loggedOutResponse(response) {
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}

export async function GET(req) {
  return loggedOutResponse(NextResponse.redirect(new URL("/login", req.url)));
}

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  return loggedOutResponse(response);
}
