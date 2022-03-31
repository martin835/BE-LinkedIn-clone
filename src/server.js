import express from "express";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import cors from "cors";

import postRouter from "./services/post/index.js";
import experiencesRouter from "./services/experiences/index.js";
import profileRouter from "./services/profile/index.js";
import friendsRouter from "./services/friends/index.js";


import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandler.js";

const server = express();
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
const port = process.env.PORT;
//***********************************Middlewares*******************************************************/

server.use(
  cors({
    origin: function (origin, next) {
      //cors is a global middleware - for each request
      console.log("ORIGIN: ", origin);
      // 0 \\ 0
      if (origin === undefined || whitelist.indexOf(origin) !== -1) {
        console.log("ORIGIN ALLOWED");
        next(null, true);
      } else {
        console.log("ORIGIN NOT ALLOWED");
        next(new Error("CORS ERROR!"));
      }
    },
  })
);

server.use(express.json());

//***********************************Endpoints*********************************************************/
server.use("/posts", postRouter);
server.use("/profile", [profileRouter, experiencesRouter]);
server.use("/friend", friendsRouter);


//***********************************Error handlers****************************************************/
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("👌 Connected to Mongo!");

  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`🚀 Server listening on port ${port}`);
  });
});
