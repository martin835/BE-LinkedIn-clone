import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo";
import ExperiencesModel from "./model.js";
import ProfileModel from "../profile/model.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { pipeline } from "stream";
import json2csv from 'json2csv';
import axios from "axios";
import { checkExperienceSchema, checkValidationResult } from "./validation.js";


const experiencesRouter = express.Router();

const cloudStorageProd = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "M6-Benchmark-experiences",
  },
})
const cloudMulterProd = multer({ storage: cloudStorageProd })


experiencesRouter.get("/:userId/experiences", async (req, res, next) => {
  try {
    const experiences = await ExperiencesModel.find().where("user").equals(req.params.userId).populate({ path: "user" });
    if (experiences) res.send(experiences);
    else {
      next(createError(404, `Experience with id ${req.params.experienceId} not found!`));
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
});

experiencesRouter.post("/:userId/experiences", checkExperienceSchema, checkValidationResult, async (req, res, next) => {
  try {
    console.log("📨 PING - POST REQUEST");

    const newExperience = new ExperiencesModel(req.body);

    await newExperience.save();

    res.send(newExperience);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.get("/:userId/experiences/CSV", async (req, res, next) => {
  try {

    console.log(req.params.userId);

    res.setHeader("Content-Disposition", "attachment; filename=experiences.csv")
    const experience = await axios.get(
      `http://localhost:3001/profile/${req.params.userId}/experiences`,
      {
        responseType: "application/json",
      }
    );

    console.log(experience.data)


    const source = JSON.stringify(experience.data);

    const transform = new json2csv.Transform({ fields: ["_id", "role", "company", "description", "startDate", "endDate"] })

    const destination = res

    pipeline(source, transform, destination, err => {
      console.log(err)
    })

  } catch (error) {
    next(error);
    console.log(error);
  }
});

experiencesRouter.get("/:userId/experiences/:experienceId", async (req, res, next) => {
  try {
    const experience = await ExperiencesModel.findById(req.params.experienceId).populate({ path: "user" });
    if (experience) res.send(experience);
    else {
      next(createError(404, `Experience with id ${req.params.experienceId} not found!`));
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
});

experiencesRouter.put("/:userId/experiences/:experienceId", checkExperienceSchema, checkValidationResult, async (req, res, next) => {
  try {
    const updatedExperience = await ExperiencesModel.findByIdAndUpdate(
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

experiencesRouter.delete("/:userId/experiences/:experienceId", async (req, res, next) => {
  try {
    const deletedExperience = await ExperiencesModel.findByIdAndDelete(
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

experiencesRouter.post("/:userId/experiences/:experienceId/picture", cloudMulterProd.single("image"), async (req, res, next) => {
  try {
    const experience = await ExperiencesModel.findByIdAndUpdate(req.params.experienceId, { image: req.file.path }, { new: true });

    res.send(experience);
  } catch (error) {
    console.log(error);
    next(error);
  }
});



export default experiencesRouter;
