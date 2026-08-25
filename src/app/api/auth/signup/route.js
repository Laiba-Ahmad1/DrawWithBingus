import db from "@/lib/db";
import { NextResponse } from "next/server";
import Users from "@/models/Users";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await db();

  try {
    const { name, email, password, gender } = await req.json();

    if (
      !name ||
      name.trim() === "" ||
      !email ||
      email.trim() === "" ||
      !password ||
      password.trim() === "" ||
      !gender ||
      gender.trim() === "" 
    ) {
      return NextResponse.json(
        {
          status: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const user = await Users.findOne({ email });
    if (user) {
      return NextResponse.json(
        {
          status: false,
          message: "Account already exists with this email",
        },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    await Users.create({ name, email, password: hash, gender });

    return NextResponse.json({
      status: true,
      message: "Account Created",
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        status: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
