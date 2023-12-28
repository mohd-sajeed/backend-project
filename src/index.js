// Import the dotenv package to handle environment variables
import dotenv from "dotenv";
// Import the connectDB function from the index.db.js file
import connectDB from "./db/index.db.js";
// Import the app module from the app.js file
import app from './app.js';

// Initialize dotenv with the path to the .env file
dotenv.config({
  path: "./.env",
});

// Connect to the database and start the server
connectDB()
  .then(() => {
    // Start listening on either the provided PORT or default to 8000, and log a message once it's running
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port :${process.env.PORT}`);

      // Set up error handling for server issues
      app.on("error", () => {
        console.log("error :", error);
      });
    });
  })
  .catch((err) => {
    // Log an error message if MongoDB connection fails
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
