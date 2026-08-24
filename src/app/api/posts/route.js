import { NextResponse } from "next/server";
import db from "@/lib/db";
import Drawing from "@/models/Drawing";


//gets all the drawing plus populates the userId field with the name of the user who posted it
export async function GET() {
  await db();
  const drawings = await Drawing.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name");
  return NextResponse.json({ status: true, drawings });
}

// PATCH ?id=<drawingId>  body: { votedFor: "user" | "computer" }
// Uses a query param instead of a [id]/route.js folder so voting and
// listing can live in one file, per your "fewer files" preference.
export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const { votedFor } = await req.json();

  if (!id || (votedFor !== "user" && votedFor !== "computer")) {
    return NextResponse.json(
      { status: false, message: "Missing id or invalid votedFor" },
      { status: 400 }
    );
  }

  await db();
  // $inc atomically bumps the vote count — avoids a read-then-write race
  // if two people vote on the same drawing at nearly the same time.
  const drawing = await Drawing.findByIdAndUpdate(
    id,
    { $inc: { [`votes.${votedFor}`]: 1 } },
    { new: true }
  );

  if (!drawing) {
    return NextResponse.json(
      { status: false, message: "Drawing not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ status: true, drawing });
}