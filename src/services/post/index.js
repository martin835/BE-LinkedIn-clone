import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo";
import PostModel from "./model.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import Profile from "../profile/model.js";

const cloudinaryUploadPostImage = multer({
  storage: new CloudinaryStorage({
    cloudinary, // search automatically for process.env.CLOUDINARY_URL (looking for Cloudinary credentials)
    params: {
      folder: "post-covers",
    },
  }),
}).single("post");

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
    console.log("🪃 PING - GET ALL POSTS REQUEST");
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

postRouter.get("/:postId", async (req, res, next) => {
  try {
    console.log("🪃 PING - GET ONE POST REQUEST");
    //console.log("REQ QUERY: ", req.query);
    //console.log("QUERY-TO-MONGO: ", q2m(req.query));
    // const mongoQuery = q2m(req.query);

    const data = await PostModel.findById(req.params.postId).populate({
      path: "profile",
      select: "name surname title image username",
    });

    res.send(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//4 Edit a Post
postRouter.put("/:postId", async (req, res, next) => {
  try {
    console.log("📑 PING - EDIT Post REQUEST");

    const editedPost = await PostModel.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!editedPost) {
      next(createError(404, `Post with id ${req.params.postId} not found.`));
    }

    res.send(editedPost);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
//5 Delete a Post

postRouter.delete("/:postId", async (req, res, next) => {
  try {
    console.log("🧨 PING - DELETE Post REQUEST");
    const deletePost = await PostModel.findByIdAndDelete(req.params.postId);
    if (deletePost) {
      res.status(204).send();
    } else {
      next(
        createError(404, `Blog post with id ${req.params.postId} not found :(`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//6 Upload Post Cover
postRouter.post(
  "/uploadPostCover",
  cloudinaryUploadPostImage,
  async (req, res, next) => {
    try {
      console.log("📤 PING - Upload Post Cover Image REQUEST");
      console.log("FILE in the request is: ", req.file);
      res.send("Uploaded on Cloudinary!");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default postRouter;
