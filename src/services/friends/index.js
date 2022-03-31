import express from "express";
import friendsModel from "./model.js";
import ProfileModel from "../profile/model.js";
import profileRouter from "../profile/index.js";

const friendsRouter = express.Router();


friendsRouter.post("/:userA/request/:userB",  async (req, res, next) => {
  try {
      const newRequest = await new friendsModel({
        requester: req.params.userA,
        recipient: req.params.userB,
        status: "Requested"
      })

      const newPending = await new friendsModel({
        requester: req.params.userB,
        recipient: req.params.userA,
        status: "Pending"
      });

      await newRequest.save();

      await newPending.save();

      const updateUserA = await ProfileModel.findByIdAndUpdate(
        req.params.userA ,
        { $push: { friends: newRequest._id }}
    )

    const updateUserB = await ProfileModel.findByIdAndUpdate(
       req.params.userB ,
        { $push: { friends: newPending._id }}
    )

      res.send({newRequest, newPending})
  } catch (error) {
    console.log(error);
    next(error);
  }
});

friendsRouter.get("/", async (req, res, next) => {
    try {
      const requests = await friendsModel.find()
      res.send(requests);
    } catch (error) {
      next(error);
      console.log(error);
    }
  });

friendsRouter.put("/:userA/accept/:userB", async (req, res, next) => {
    try {
      const updateFriendA = await friendsModel.findOneAndUpdate(
        {requester: req.params.userA, recipient: req.params.userB},
        {status: "Friends"},
        { new: true, runValidators: true }
      ).populate({path: "requester", select:"name surname"}).populate({path: "recipient", select: "name surname"})

      const updateFriendB = await friendsModel.findOneAndUpdate(
        {requester: req.params.userB, recipient: req.params.userA},
        {status: "Friends"},
        { new: true, runValidators: true }
      ).populate({path: "requester", select:"name surname"}).populate({path: "recipient", select: "name surname"})
  
      res.send({updateFriendA, updateFriendB})

    } catch (error) {
      next(error);
      console.log(error);
    }
  });

  friendsRouter.delete("/:userA/refuse/:userB", async (req, res, next) => {
    try {

        const requestA = await friendsModel.findOneAndRemove(
            { requester: req.params.userA, recipient: req.params.userB }
        )
        const requestB = await friendsModel.findOneAndRemove(
            { recipient: req.params.userA, requester: req.params.userB}
        )

        const updateProfileA = await ProfileModel.findByIdAndUpdate(
            req.params.userA,
            { $pull: { friends: requestA._id }}
        )
        const updateProfileB = await ProfileModel.findByIdAndUpdate(
            req.params.userB,
            { $pull: { friends: requestB._id }}
        )

      res.status(204).send()

    } catch (error) {
      next(error);
      console.log(error);
    }
  });


export default friendsRouter;
