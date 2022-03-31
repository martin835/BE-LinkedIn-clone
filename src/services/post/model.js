import mongoose from "mongoose";
import Profile from "../profile/model.js";

const { Schema, model } = mongoose;

const postsSchema = new Schema(
  {
    text: { type: String, required: true },
    image: { type: String },
    cloudinary_id: { type: String },
    profile: {
      type: mongoose.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    comments: [
      {
        comment: { type: String, required: true },
        commentDate: { type: Date, required: true },
      },
    ],
    likes: {
      default: [],
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Profile",
          _id: false
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default model("Post", postsSchema);
