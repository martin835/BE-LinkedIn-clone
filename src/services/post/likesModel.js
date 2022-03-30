import mongoose from "mongoose";

const { Schema, model } = mongoose;

const likesSchema = new Schema(
  {
    users: [
      {
        userId: { type: mongoose.Types.ObjectId, ref: "Profile" },
        _id: false,
      },
    ],
    postId: { type: mongoose.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

export default model("Likes", likesSchema);
