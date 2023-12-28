// Importing custom error handler for API errors
import apiError from "../utils/apiError.js";

// Importing async handler to handle asynchronous functions
import asyncHandler from "../utils/asyncHandler.js";

// Importing JSON Web Token library for token verification
import jwt from "jsonwebtoken";

// Importing User model from user.model.js file
import { User } from "../models/user.model.js";


// Defining an asynchronous middleware function to verify JWT token
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Extracting token from cookies or header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // If no token is found, throw unauthorized request error
    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    // Verifying the extracted token using the secret key
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Finding user by ID based on decoded token and excluding password and refresh token fields
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    // If no user is found, throw invalid access token error
    if (!user) {
      throw new apiError(401, "Invalid Access Token");
    }

    // Assigning the found user to the request object and calling next middleware function
    req.user = user;
    next();
  } catch (error) {
    // If any error occurs during the process, throw a generic invalid access token error with message if available
    throw new apiError(401, error?.message || "Invalid access token")
  }
});
