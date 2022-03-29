import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo";
import ExperiencesModel from "./model.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const experiencesRouter = express.Router();

experiencesRouter.post("/", async (req, res, next) => {
  try {
    console.log("📨 PING - POST REQUEST");

    const newExperience = new ExperiencesModel(req.body);

    await newExperience.save();

    res.send(newExperience._id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.get("/:experienceId", async (req, res, next) => {
  try {
    const experience = await experiencesModel.findById(req.params.experienceId);
    if (experience) res.send(experience);
    else {
      next(createError(404, `Experience with id ${req.params.experienceId} not found!`));
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
});

experiencesRouter.put("/:experienceId", async (req, res, next) => {
  try {
    const updatedExperience = await experiencesModel.findByIdAndUpdate(
      req.params.experienceId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedExperience) res.send(updatedExperience);
    else {
      next(createError(404, `Experience with id ${req.params.experienceId} not found!`));
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
});

experiencesRouter.delete("/:experienceId", async (req, res, next) => {
  try {
    const deletedExperience = await experiencesModel.findByIdAndDelete(
      req.params.experienceId
    );
    if (deletedExperience) res.status(204).send();
    else {
      next(createError(404, `Experience with id ${req.params.experienceId} not found!`));
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
});

// experiencesRouter.get("/:profileId/downloadPDF", (req, res, next) => {
//   try {
//     res.setHeader("Content-Disposition", "attachment; filename=example.pdf");
//     const source = getPDFReadableStream(getBlogReadableStream());
//     const destination = res;

//     pipeline(source, destination, (err) => {
//       console.log(err);
//     });
//   } catch (error) {
//     next(error);
//   }
// });

export default experiencesRouter;
