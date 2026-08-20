import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import Users from "@/models/Users";

export async function getCurrentUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    await db();
    const user = await Users.findById(decoded.id).select("-password").lean();
    return user;
  } catch (err) {
    return null;
  }
}