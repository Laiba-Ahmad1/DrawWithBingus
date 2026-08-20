import mongoose from "mongoose";

const CalmlyUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.models.Users || mongoose.model("Users", CalmlyUserSchema);

export default Users;