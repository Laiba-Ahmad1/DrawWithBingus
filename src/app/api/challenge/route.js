import db from "@/lib/db";
import { NextResponse } from "next/server";
import Drawing from "@/models/Drawing";
import {getCurrentUser} from "@/lib/getCurrentuser"
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  await db();
    
  try {
    const user = await getCurrentUser(); //safer to get user from token and then verify
    if(!user){
        return NextResponse.json(
            {status: false, message: "Unauthorized"},
            {status: 401}
        );
    }
    
    const { prompt, userDrawing, computerDrawing } = await req.json();
    
    if (!prompt || !userDrawing) {
    return NextResponse.json({ error: "Missing prompt or drawing" }, { status: 400 });
    }

    let uploaded;
  try {
    uploaded = await cloudinary.uploader.upload(userDrawing, {
      folder: "drawwithbingus/user-drawings",
    });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }


    const drawing = await Drawing.create({
        userId: user._id,
        prompt,
        userDrawingUrl: uploaded.secure_url,
        computerDrawingUrl: computerDrawing,
        votes: { user: 0, computer: 0 },
    })

    return NextResponse.json({
      status: true,
      message: "Drawing Posted Successfully",
      drawing
    },
    {status: 201}
    );
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