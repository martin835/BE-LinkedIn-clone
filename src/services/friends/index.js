import express from "express";
import friendsModel from "./model.js";
import ProfileModel from "../profile/model.js";

const friendsRouter = express.Router();


friendsRouter.post("/:userA/request/:userB",  async (req, res, next) => {
  try {
      const newRequest = await new friendsModel({
        requester: req.params.userA,
        recipient: req.params.userB,
        status: 1
      });

      const newPending = await new friendsModel({
        requester: req.params.userB,
        recipient: req.params.userA,
        status: 2
      });

      await newRequest.save();

      await newPending.save();

      const updateUserA = await ProfileModel.findByIdAndUpdate(
        req.params.userA ,
        { $push: { friends: newRequest._id }}
    ).populate({path: "friends"})

    const updateUserB = await ProfileModel.findByIdAndUpdate(
       req.params.userB ,
        { $push: { friends: newPending._id }}
    ).populate({path: "friends"})

      res.send({updateUserA, updateUserB})
  } catch (error) {
    console.log(error);
    next(error);
  }
});



export default friendsRouter;
