// Importing the mongoose library for MongoDB interaction
import mongoose from "mongoose";
// Importing the DB_NAME constant from a file named constants.js
import { DB_NAME } from "../constants.js";

// Declaring an asynchronous function named connectDB
const connectDB = async () => {
  try {
    // Creating a database URI by combining the MONGODB_URI environment variable and the DB_NAME constant
    const dbURI = `${process.env.MONGODB_URI}/${DB_NAME}`;
    // Connecting to the MongoDB database using the created database URI and storing the connection instance
    const connectionInstance = await mongoose.connect(dbURI);
    
    // Logging a success message with the connected database host information
    console.log(`\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}`);
  } catch (error) {
    // Logging an error message if the MongoDB connection fails and exiting the process with code 1
    console.log("mongodb connection Failed", error);
    process.exit(1);
  }
};

// Exporting the connectDB function as a default export for use in other files
export default connectDB;
