import mongoose from "mongoose";

const drawingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  prompt: { type: String, required: true },
  userDrawingUrl: { type: String, required: true }, // Cloudinary URL
  computerDrawingUrl: { type: String, required: true }, // Bingus's pre-made drawing for this prompt
  votes: {
  user: { type: Number, default: 0 },
},
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], // NEW
  createdAt: { type: Date, default: Date.now },
});
const Drawings =
  mongoose.models.Drawings || mongoose.model("Drawings", drawingSchema);

export default Drawings;
