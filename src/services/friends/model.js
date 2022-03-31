import mongoose from "mongoose";

const { Schema, model } = mongoose;

const friendSchema = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'Profile'},
      recipient: { type: Schema.Types.ObjectId, ref: 'Profile'},
      status: {
        type: Number,
        enums: [
            0,    //'add friend',
            1,    //'requested',
            2,    //'pending',
            3,    //'friends'
        ]
      }
    }, {timestamps: true}
);

export default model("friend", friendSchema);