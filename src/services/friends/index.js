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
        status: "Pending"
      })

      await newRequest.save();

      const updateUserA = await ProfileModel.findByIdAndUpdate(
        req.params.userA ,
        { $push: { friends: newRequest._id }}
    )

    const updateUserB = await ProfileModel.findByIdAndUpdate(
       req.params.userB ,
        { $push: { friends: newRequest._id }}
    )

      res.send({newRequest})
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
      const updateFriendship = await friendsModel.findOneAndUpdate(
        {requester: req.params.userA, recipient: req.params.userB},
        {status: "Friends"},
        { new: true, runValidators: true }
      ).populate({path: "requester", select:"name surname image title"}).populate({path: "recipient", select: "name surname image title"})
  
      res.send({updateFriendship})

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

        const updateProfileA = await ProfileModel.findByIdAndUpdate(
            req.params.userA,
            { $pull: { friends: requestA._id }}
        )
        const updateProfileB = await ProfileModel.findByIdAndUpdate(
            req.params.userB,
            { $pull: { friends: requestA._id }}
        )

      res.status(204).send()

    } catch (error) {
      next(error);
      console.log(error);
    }
  });


export default friendsRouter;
