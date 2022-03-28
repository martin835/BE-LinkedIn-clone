import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo";
import PostModel from "./model.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import Profile from "../profile/model.js";

const postRouter = express.Router();

//1 POST a POST
postRouter.post("/", async (req, res, next) => {
  try {
    console.log("📨 PING - POST REQUEST");

    const newPost = new PostModel(req.body);

    await newPost.save();

    res.send(newPost._id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//2 Get all POSTS

postRouter.get("/", async (req, res, next) => {
  try {
    console.log("➡️ PING - GET ALL REQUEST");
    //console.log("REQ QUERY: ", req.query);
    //console.log("QUERY-TO-MONGO: ", q2m(req.query));
    // const mongoQuery = q2m(req.query);

    const data = await PostModel.find().populate({
      path: "profile",
      select: "name surname title image username",
    });

    res.send(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//3 Get One Post

//4 Edit a Post

//5 Delete a Post

export default postRouter;
