import express from "express";
import messagesModel from "./model.js";
import ProfileModel from "../profile/model.js";

const messagesRouter = express.Router();


messagesRouter.post("/:userA/send/:userB",  async (req, res, next) => {
  try {
      const newMessage = await new messagesModel({
        sender: req.params.userA,
        recipient: req.params.userB,
        text: req.body.text
      })

      await newMessage.save();

      res.send({newMessage})
  } catch (error) {
    console.log(error);
    next(error);
  }
});

 messagesRouter.get("/:userA/and/:userB", async (req, res, next) => {

    try {
      const data = await messagesModel.find({$or:[{sender: req.params.userA, recipient:req.params.userB}, {sender: req.params.userB, recipient:req.params.userA} ]}).populate({
        path:"sender", 
        select: "name surname "
      }).populate({
        path: "recipient",
        select: "name surname"
      })
  
      res.send(data)
    } catch (error) {
      console.log(error)
      next(error)
    }
  })


export default messagesRouter;
