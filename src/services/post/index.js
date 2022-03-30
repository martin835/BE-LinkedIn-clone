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

postRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new PostModel(req.body);
    await newPost.save();

    res.send(newPost._id);
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
  "/uploadPostCover",
  cloudinaryUploadPostImage,
  async (req, res, next) => {
    try {
      res.send("Uploaded on Cloudinary!");
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

// postRouter.post("/:postId/likes", async (req, res, next) => {
//   try {
//     const { userId } = req.body;

//     const post = await PostModel.findById(req.params.postId);
//     if (!post)
//       return next(
//         createError(404, `Post with id ${req.params.postId} not found`)
//       );

//     console.log(post)

//     const user = await ProfileModel.findById(userId);
//     if (!user)
//       return next(createError(404, `User with id ${userId} not found`));

//     const isPostLiked = await PostModel.findOne({
//       _id: req.params.postId,
//       "likes.userId": user._id,
//     });

//     console.log(isPostLiked);

//     if (isPostLiked) {

//       const modifiedLikes = await PostModel.findOneAndUpdate(
//         {
//           _id: req.params.postId,
//         },
//         {
//           $pull: { likes: { userId: userId } },
//         },
//         {
//           new: true,
//         }
//       );
//       res.send(modifiedLikes);
//     } else {
//       const modifiedLikes = await PostModel.findOneAndUpdate(
//         { _id: req.params.postId },
//         { $push: { likes: { userId: user._id } } },
//         {
//           new: true,
//           upsert: true,
//         }
//       );
//       res.send(modifiedLikes);
//     }
//   } catch (error) {
//     next(error);
//   }
// });

export default postRouter;
