//  require("dotenv").config({path:"./env"})
import dotenv from "dotenv";
import connectDB from "./db/index.db.js";
import app from './app.js';

// Initialize dotenv
dotenv.config({
  path: "./.env",
});

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port :${process.env.PORT}`);

      // Error handling for server issues
      app.on("error", () => {
        console.log("error :", error);
      });
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!!", err);
  });

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
