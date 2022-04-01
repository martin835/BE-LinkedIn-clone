import mongoose from "mongoose";

const { Schema, model } = mongoose;

const friendSchema = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'Profile'},
      recipient: { type: Schema.Types.ObjectId, ref: 'Profile'},
      status: {
        type: String,
        enums: [
            "Pending",    
            "Friends",   
        ]
      }
    },
    {
        timestamps: true
    }
)

export default model("friend", friendSchema);