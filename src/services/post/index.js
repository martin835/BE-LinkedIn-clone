import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo";
import PostModel from "./model.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import ProfileModel from "../profile/model.js";

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
postRouter.post("/", cloudinaryUploadPostImage, async (req, res, next) => {
  try {

    if (req.file) {
      const newPost = new PostModel({
        text: req.body.text,
        profile: req.body.profile,
        image: req.file.path,
        cloudinary_id: req.file.filename,
      });

      await newPost.save();

      res.send(newPost);
    } else {
      const newPost = new PostModel({
        text: req.body.text,
        profile: req.body.profile,
        image: "http://placeimg.com/640/480",
      });

      await newPost.save();

      res.send(newPost);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

postRouter.get("/", async (req, res, next) => {
  try {
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

postRouter.get("/:postId", async (req, res, next) => {
  try {
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

postRouter.put("/:postId", async (req, res, next) => {
  try {
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

postRouter.delete("/:postId", async (req, res, next) => {
  try {

    const postToDelete = await PostModel.findById(req.params.postId);
    console.log(postToDelete);

    if (postToDelete.cloudinary_id) {
      await cloudinary.uploader.destroy(postToDelete.cloudinary_id);
    }

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

postRouter.post(
  "/:postId/uploadPostCover",
  cloudinaryUploadPostImage,
  async (req, res, next) => {
    try {
      res.send("Uploaded on Cloudinary!");

      const editedPost = await PostModel.findByIdAndUpdate(
        req.params.postId,
        { image: req.file.path },
        { new: true, runValidators: true }
      );

      res.send(editedPost);

    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

postRouter.post("/:postId/likes", async (req, res, next) => {
  try {
    const { id } = req.body;
    const isLiked = await PostModel.findOne({ _id: req.params.postId, likes: id });
    if (isLiked) {
      await PostModel.findByIdAndUpdate(req.params.postId, { $pull: { likes: id } });
      res.send("Unliked");
    }
    if (!isLiked) {
      await PostModel.findByIdAndUpdate(req.params.postId, { $push: { likes: id } });
      res.send("Liked");
    }
    console.log(!isLiked)
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

export default postRouter;
