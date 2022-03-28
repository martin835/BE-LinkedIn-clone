import mongoose from "mongoose";
import Profile from "../profile/model.js";

const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    text: { type: String, required: true },
    image: { type: String },
    profile: {
      type: mongoose.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Post", postSchema);
