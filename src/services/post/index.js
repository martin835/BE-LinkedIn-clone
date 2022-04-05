
import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo";
import PostModel from "./model.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import ProfileModel from "../profile/model.js";
import { checkPostSchema, checkCommentSchema } from "./validation.js";
import { checkValidationResult } from "../experiences/validation.js";

const cloudinaryUploadPostImage = multer({
  storage: new CloudinaryStorage({
    cloudinary, // search automatically for process.env.CLOUDINARY_URL (looking for Cloudinary credentials)
    params: {
      folder: "post-covers",
    },
  }), limits: { fileSize: 3145728 }
}).single("post")

const postRouter = express.Router()

//1 POST a POST

postRouter.post("/", cloudinaryUploadPostImage, checkPostSchema, checkValidationResult, async (req, res, next) => {

  try {
    if (req.file) {

      const newPost = new PostModel({
        text: req.body.text,
        profile: req.body.profile,
        image: req.file.path,
        cloudinary_id: req.file.filename,
      })

      await newPost.save()

      res.send(newPost)
    }
    if (!req.file) {
      const newPost = new PostModel({
        text: req.body.text,
        profile: req.body.profile,
        image: "",
      });

      // http://placeimg.com/640/480

      await newPost.save()

      res.send(newPost)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//2 Get all POSTS
postRouter.get("/", async (req, res, next) => {

  try {
    const data = await PostModel.find().populate({
      path:"comments", populate: 
      {path: "profile",
      select: "name surname title image username"}
    }).populate({
      path: "profile",
      select: "name surname title image username"
    })

    res.send(data)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//3 Get One Post
postRouter.get("/:postId", async (req, res, next) => {

  try {
    const data = await PostModel.findById(req.params.postId).populate({
      path:"comments", populate: 
      {path: "profile",
      select: "name surname title image username"}
    }).populate({
      path: "profile",
      select: "name surname title image username"
    })

    res.send(data)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//4 Edit a Post

postRouter.put("/:postId", checkPostSchema, checkValidationResult, async (req, res, next) => {

  try {
    const editedPost = await PostModel.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true, runValidators: true }
    )

    if (!editedPost)
      next(createError(404, `Post with id ${req.params.postId} not found.`))


    res.send(editedPost)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//5 Delete a Post

postRouter.delete("/:postId", async (req, res, next) => {

  try {
    const postToDelete = await PostModel.findById(req.params.postId)

    if (postToDelete.cloudinary_id) {
      await cloudinary.uploader.destroy(postToDelete.cloudinary_id)
    }

    const deletePost = await PostModel.findByIdAndDelete(req.params.postId)
    if (deletePost) {
      res.status(204).send()
    }
    if (!deletePost)
      next(
        createError(404, `Blog post with id ${req.params.postId} not found :(`)
      )

  } catch (error) {
    console.log(error)
    next(error)
  }
})

//6 Upload Post Cover

postRouter.post("/:postId/uploadPostCover", cloudinaryUploadPostImage, async (req, res, next) => {

  try {
    const editedPost = await PostModel.findByIdAndUpdate(
      req.params.postId,
      { image: req.file.path, cloudinary_id: req.file.filename },
      { new: true, runValidators: true }
    )

    res.send(editedPost)
  } catch (error) {
    console.log(error)
    next(error)
  }
}
)

postRouter.post("/:postId/likes", async (req, res, next) => {

  try {
    const { id } = req.body
    const isLiked = await PostModel.findOne({
      _id: req.params.postId,
      likes: id,
    })
    if (isLiked) {
      await PostModel.findByIdAndUpdate(req.params.postId, {
        $pull: { likes: id },
      })
      res.send("Unliked")
    }
    if (!isLiked) {
      await PostModel.findByIdAndUpdate(req.params.postId, {
        $push: { likes: id },
      })
      res.send("Liked")
    }
    console.log(!isLiked)
  } catch (error) {
    res.send(500).send({ message: error.message })
  }
})


//6  POST a COMMENT to a Post
postRouter.post("/:postId/comments", checkCommentSchema, checkValidationResult, async (req, res, next) => {

  try {
    const newComment = {
      ...req.body,
      commentDate: new Date(),
    }

    const post = await PostModel.findByIdAndUpdate(
      req.params.postId,
      { $push: { comments: newComment } },
      { new: true, runValidators: true }
    )

    if (post) res.send(post)
    if (!post)
      next(createError(404, `Post with id ${req.params.postId} not found.`))
  } catch (error) {
    console.log(error)
  }
})


//7 GET COMMENTS for a Post

postRouter.get("/:postId/comments", async (req, res, next) => {
  try {
    const comments = await PostModel.findById(req.params.postId)
      .populate({ path: "comments", populate: { path: "comments" } })
      .populate({
        path: "comments", populate: { path: "profile", select: "name surname image username " }
      })

    if (comments) res.send(comments.comments)

    if (!comments)
      next(
        createError(404, `Blog post with id ${req.params.postId} not found!`)
      )
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//8 GET ONE COMMENT from a Post

postRouter.get("/:postId/comments/:commentId", async (req, res, next) => {

  try {
    const post = await PostModel.findById(req.params.postId)
      .populate({ path: "comments", populate: { path: "comments" } })
      .populate({
        path: "comments", populate: { path: "profile", select: "name surname image username " }
      })
    if (post) {
      const comment = post.comments.find(
        (comment) => comment._id.toString() === req.params.commentId)

      if (comment) res.send(comment)
      if (!comment)
        next(
          createError(404, `Comment with id ${req.params.commentId} not found!`)
        )
    }
    if (!post)
      next(createError(404, `Post with id ${req.params.postId} not found!`))
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//9 EDIT a COMMENT in a Post
postRouter.put("/:postId/comments/:commentId", checkCommentSchema, checkValidationResult, async (req, res, next) => {

  try {
    const post = await PostModel.findById(req.params.postId)
    if (post) {
      const index = post.comments.findIndex(
        (comment) => comment._id.toString() === req.params.commentId
      )
      if (index !== -1) {
        post.comments[index] = {
          ...post.comments[index].toObject(),
          ...req.body,
          commentDate: new Date(),
        }

        await post.save()
        res.status(200).send(post)
      }
      if (index == -1)
        next(
          createError(404, `Comment with id ${req.params.commentId} not found!`)
        )
    }
    if (!post) {
      next(
        createError(404, `Blog post with id ${req.params.postId} not found!`)
      )
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

//10 DELETE A COMMENT in a Post

postRouter.delete("/:postId/comments/:commentId", async (req, res, next) => {

  try {
    const post = await PostModel.findByIdAndUpdate(
      req.params.postId,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    )
    if (post) {
      res.send(post)
    }
    if (!post)
      next(createError(404, `Post with id ${req.params.postId} not found!`))
  } catch (error) {
    console.log(error)
  }
})

export default postRouter
