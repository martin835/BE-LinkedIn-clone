import express from "express";
import createError from "http-errors";
import profileModel from "./model.js";
import { getPDFReadableStream } from "./pdf-tools.js";

const profileRouter = express.Router();

profileRouter.get("/", async (req, res, next) => {
  try {
    const profiles = await profileModel.find();
    res.send(profiles);
  } catch (error) {
    next(error);
    console.log(error);
  }
});

profileRouter.post("/", async (req, res, next) => {
  try {
    const newProfile = new profileModel(req.body);

    const { _id } = await newProfile.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
    console.log(error);
  }
});

profileRouter.get("/:userId", async (req, res, next) => {
  try {
    const profile = await profileModel.findById(req.params.userId);
    if (profile) res.send(profile);
    else {
      next(createError(404, `user with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
});

profileRouter.put("/:userId", async (req, res, next) => {
  try {
    const updatedProfile = await profileModel.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedProfile) {
      res.send(updatedProfile);
    } else {
      next(createError(404, `user with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
});

profileRouter.delete("/:userId", async (req, res, next) => {
  try {
    const deletedProfile = await profileModel.findByIdAndDelete(
      req.params.userId
    );
    if (deletedProfile) {
      res.status(204).send();
    } else {
      next(createError(404, `user with id ${req.params.userId} not found!`));
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
});

profileRouter.get("/:profileId/downloadPDF", (req, res, next) => {
  try {
    // SOURCE (readable stream from pdfmake) --> DESTINATION (http response)

    res.setHeader("Content-Disposition", "attachment; filename=example.pdf"); // This header tells the browser to open the "save file on disk" dialog

    const source = getPDFReadableStream(getBlogReadableStream());
    const destination = res;

    pipeline(source, destination, (err) => {
      console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

export default profileRouter;
