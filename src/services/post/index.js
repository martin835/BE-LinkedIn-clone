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
        { image: req.file.path, cloudinary_id: req.file.filename },
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
    const isLiked = await PostModel.findOne({
      _id: req.params.postId,
      likes: id,
    });
    if (isLiked) {
      await PostModel.findByIdAndUpdate(req.params.postId, {
        $pull: { likes: id },
      });
      res.send("Unliked");
    }
    if (!isLiked) {
      await PostModel.findByIdAndUpdate(req.params.postId, {
        $push: { likes: id },
      });
      res.send("Liked");
    }
    console.log(!isLiked);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

//6  POST a COMMENT to a Post
postRouter.post("/:postId/comments", async (req, res, next) => {
  try {
    const newComment = {
      ...req.body,
      commentDate: new Date(),
    };

    const post = await PostModel.findByIdAndUpdate(
      req.params.postId,
      { $push: { comments: newComment } },
      { new: true, runValidators: true }
    );

    if (post) res.send(post);
    if (!post)
      next(createError(404, `Post with id ${req.params.postId} not found.`));
  } catch (error) {
    console.log(error);
  }
});

//7 GET COMMENTS for  a BlogPost
postRouter.get("/:postId/comments", async (req, res, next) => {
  try {
    const comments = await PostModel.findById(req.params.postId);
    if (comments) res.send(comments.comments);
    if (!comments)
      next(
        createError(404, `Blog post with id ${req.params.postId} not found!`)
      );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//8 GET ONE COMMENT from a BlogPost
postRouter.get("/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.postId);
    if (post) {
      const comment = post.comments.find(
        (comment) => comment._id.toString() === req.params.commentId
      );

      if (comment) res.send(comment);
      if (!comment)
        next(
          createError(404, `Comment with id ${req.params.commentId} not found!`)
        );
    }
    if (!post)
      next(createError(404, `Post with id ${req.params.postId} not found!`));
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//9 EDIT a COMMENT in a BlogPost --> fix this
postRouter.put("/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.postId);
    if (post) {
      const index = post.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      );
      if (index !== -1) {
        post.comments[index] = {
          ...post.comments[index].toObject(),
          ...req.body,
          commentDate: new Date(),
        };

        await post.save();
        res.status(200).send(post);
      }
      if (index == -1)
        next(
          createError(404, `Comment with id ${req.params.commentId} not found!`)
        );
    }
    if (!post) {
      next(
        createError(404, `Blog post with id ${req.params.postId} not found!`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//10 DELETE A COMMENT in a BlogPost
postRouter.delete("/:postId/comments/:commentId", async (req, res, next) => {
  try {
    const post = await PostModel.findByIdAndUpdate(
      req.params.postId,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    );
    if (post) {
      res.send(post);
    }
    if (!post)
      next(createError(404, `Post with id ${req.params.postId} not found!`));
  } catch (error) {
    console.log(error);
  }
});

export default postRouter;
