import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {

    const dbURI = `${process.env.MONGODB_URI}/${DB_NAME}`
    const connectionInstance = await mongoose.connect(dbURI)  
    
    
    console.log(`\n MongoDB connected !! DB HOST:${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("mongodb connection Failed", error);
    process.exit(1);
  }
};

export default connectDB;
