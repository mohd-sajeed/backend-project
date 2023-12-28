// Import asyncHandler for handling asynchronous functions without repeated try/catch blocks
import asyncHandler from "../utils/asyncHandler.js";

// Import apiError for standardized error handling and messaging
import apiError from "../utils/apiError.js";

// Import the User model for interacting with the User collection in the database
import { User } from "../models/user.model.js";

// Import uploadOnCloudinary for handling file uploads to Cloudinary
import uploadOnCloudinary from "../utils/cloudinary.js";

// Import apiResponse for standardizing API responses
import apiResponse from "../utils/apiResponse.js";

import Jwt  from "jsonwebtoken";

// Define a function to generate access and refresh tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find the user by their ID
    const user = await User.findById(userId);

    // Generate an access token for the user
    const accessToken = user.generateAccessToken();

    // Generate a refresh token for the user
    const refreshToken = user.generateRefreshToken();

    // Update the user's refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    // Throw a standardized error if something goes wrong
    throw new apiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// Define a function to handle user registration, wrapped with asyncHandler
const registerUser = asyncHandler(async (req, res) => {
  // Extract user details from the request body
  const { fullname, email, username, password } = req.body;

  // Validate that none of the fields are empty
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  // Check if a user with the same username or email already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // Throw an error if the user already exists
  if (existedUser) {
    throw new apiError(409, "User with email and username already exist");
  }

  // Handling file uploads: Check and get the path of avatar and cover image files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Ensure that the avatar file is provided
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  // Upload avatar and cover image to Cloudinary and get their URLs
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // Validate avatar upload success
  if (!avatar) {
    throw new apiError(400, "Avatar file is required");
  }

  // Create a new user in the database with provided and uploaded data
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Retrieve the created user without sensitive fields like password and refresh token
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Check if the user was successfully created
  if (!createdUser) {
    throw new apiError(500, "something went wrong while registering the user");
  }

  // Respond with a success message and the user data
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered Successfully"));
});

// Define a function to handle user login, wrapped with asyncHandler
const loginUser = asyncHandler(async (req, res) => {
  // Extract login credentials from the request body
  const { username, email, password } = req.body;

  // Validate that either username or email is provided
  if (!(username || email)) {
    throw new apiError(400, "username or email is required");
  }

  // Find the user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // Throw an error if the user does not exist
  if (!user) {
    throw new apiError(404, "user does not exist");
  }

  // Validate the provided password
  const isPasswordValid = await user.isPasswordCorrect(password)
  

  // Throw an error if the password is invalid
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }

  // Generate access and refresh tokens for the user
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  // Retrieve the logged in user without sensitive fields like password and refresh token
  const loggedInUser = await User.findById(user._id).select( "-password -refreshToken" )

  // Set options for HTTP cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Send back access and refresh tokens as cookies along with user data
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        "User logged in Successfully"
      )
    );
});

// Define a function to handle user logout, wrapped with asyncHandler
const logoutUser = asyncHandler(async (req, res) => {
   // Update the user's refresh token to undefined to invalidate it
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  // Set options for HTTP cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

   // Clear the access token and refresh token cookies on client side 
   return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new apiResponse(200,{}, "User logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

if(!incomingRefreshToken){
  throw new apiError(401, "unauthorized request")
}

try {
  const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
   const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw apiError(401, "Invalid refresh token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new apiError(401,"Refresh token is expired or used")
    }
  
  const options = {
    httpOnly:true,
    secure:true
  }
  
  const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
  
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshToken, options)
  .json(
    new apiResponse(
      200,
      {accessToken,refreshToken: newRefreshToken},
      "Access token refreshed"
    )
  )
} catch (error) {
  throw new apiError(401,error?.message || "Invalid refresh token")
}

})


// Export the functions to be used by other parts of the application
export { registerUser, loginUser, logoutUser,refreshAccessToken };
