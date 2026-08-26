import { NextResponse } from "next/server";
import db from "@/lib/db";
import Drawing from "@/models/Drawing";
import { getCurrentUser } from "@/lib/getCurrentuser";

//gets all the drawing plus populates the userId field with the name of the user who posted it
export async function GET() {
  await db();
  const drawings = await Drawing.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name");
  return NextResponse.json({ status: true, drawings });
}

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { status: false, message: "Missing id" },
      { status: 400 },
    );
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json(
      { status: false, message: "Not logged in" },
      { status: 401 },
    );
  }

  await db();

  // try to UNVOTE: only matches if user is currently in votedBy
  let drawing = await Drawing.findOneAndUpdate(
    { _id: id, votedBy: currentUser._id },
    {
      $inc: { "votes.user": -1 },
      $pull: { votedBy: currentUser._id },
    },
    { returnDocument: "after" },
  );

  if (drawing) {
    return NextResponse.json({ status: true, drawing, action: "unvoted" });
  }

  // otherwise try to VOTE: only matches if user is NOT in votedBy
  drawing = await Drawing.findOneAndUpdate(
    { _id: id, votedBy: { $nin: [currentUser._id] } },
    {
      $inc: { "votes.user": 1 },
      $push: { votedBy: currentUser._id },
    },
    { returnDocument: "after" },
  );

  if (!drawing) {
    const exists = await Drawing.findById(id);
    return NextResponse.json(
      {
        status: false,
        message: exists ? "Vote conflict, try again" : "Drawing not found",
      },
      { status: exists ? 409 : 404 },
    );
  }

  return NextResponse.json({ status: true, drawing, action: "voted" });
}