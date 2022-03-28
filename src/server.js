import express from "express";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import profileRouter from "./profile/index.js";
import postRouter from "./services/post/index.js";


const server = express();
const port = process.env.PORT;

//***********************************Middlewares*******************************************************/

server.use(cors());
server.use(express.json());

//***********************************Endpoints*********************************************************/


//****************************** Profile EndPoints******************************* */

server.use("/profile", profileRouter);
server.use("/posts", postRouter);


//***********************************Error handlers****************************************************/

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("👌 Connected to Mongo!");

  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`🚀 Server listening on port ${port}`);
  });
});
