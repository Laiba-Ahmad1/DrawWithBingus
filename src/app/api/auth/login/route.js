import db from "@/lib/db";
import { NextResponse } from "next/server";
import Users from "@/models/Users";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await db();

  try {
    const { email, password } = await req.json();

    if (!email || email.trim() === "" || !password || password.trim() === "") {
      return NextResponse.json(
        {
          status: false,
          message: "All fields are required",
        },
        { status: 400 },
      );
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          status: false,
          message: "Account not found",
        },
        { status: 404 },
      );
    }

    const isCorrectPass = await bcrypt.compare(password, user.password);

    if (!isCorrectPass) {
      return NextResponse.json(
        {
          status: false,
          message: "Incorrect Password",
        },
        { status: 400 },
      );
    }

    const token = await jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET_KEY, {expiresIn: '7d'}); //1:token bnaya
   
    const { password: _, ...safeUser } = user.toObject(); //front end p password na jaye isliye password ko exclude kiya
    const res = NextResponse.json({
      status: true,
      message: "Loggedin successfully",
      data: safeUser,
    });
    res.cookies.set('token',token, {httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7*24*60*60});
    return res;
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        status: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
