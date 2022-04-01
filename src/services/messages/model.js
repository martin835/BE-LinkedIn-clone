import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'Profile'},
      recipient: { type: Schema.Types.ObjectId, ref: 'Profile'},
      text: {   type: String, required: true }
      
    },
    {
        timestamps: true
    }
)

export default model("message", messageSchema);