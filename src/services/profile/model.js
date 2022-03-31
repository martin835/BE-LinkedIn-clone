import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ProfileSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, required: true },
    title: { type: String, required: true },
    area: { type: String, required: true },
    image: { type: String },
    username: { type: String, unique: true },
    friends: [{ type: Schema.Types.ObjectId, ref: 'friend'}]
  },
  {
    timestamps: true,
  }
);

export default model("Profile", ProfileSchema);
