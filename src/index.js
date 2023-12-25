//  require("dotenv").config({path:"./env"})
 import connectDB from "./db/index.db.js"

import dotenv from "dotenv"

dotenv.config({
  path:"./env"
})

connectDB()





/*
import Express from "express";
const app = Express();

(async () => {
  try {
    mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    app.on("error", () => {
      console.log("ERROR :", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR:", error);
    throw err;
  }
})()
*/
