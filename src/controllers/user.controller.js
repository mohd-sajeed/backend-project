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

import Jwt from "jsonwebtoken";
import { json } from "express";

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
  const isPasswordValid = await user.isPasswordCorrect(password);

  // Throw an error if the password is invalid
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }

  // Generate access and refresh tokens for the user
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Retrieve the logged in user without sensitive fields like password and refresh token
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

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
          refreshToken,
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
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged Out Successfully"));
});

// Define an asynchronous function 'refreshAccessToken' using 'asyncHandler'
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Get the refresh token from the cookies or the request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // If there's no refresh token, throw an unauthorized request error
  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorized request");
  }

  // Use a try-catch block to handle potential errors
  try {
    // Verify the refresh token using the secret key
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // Find the user associated with the decoded token's ID
    const user = await User.findById(decodedToken?._id);

    // If the user doesn't exist, throw an error
    if (!user) {
      throw apiError(401, "Invalid refresh token");
    }

    // If the incoming refresh token doesn't match the user's refresh token, throw an error
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh token is expired or used");
    }

    // Define options for the cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Generate new access and refresh tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // Set the status of the response to 200, set the cookies, and send the JSON response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    // If there's an error, throw an error with the message
    throw new apiError(401, error?.message || "Invalid refresh token");
  }
});

// An endpoint to change the current user's password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Find the user associated with the current session
  const user = await User.findById(req.user?._id);

  // Check if the provided old password is correct
  const isPassswordCorrect = await user.isPasswordCorrect(oldPassword);

  // If the old password is not correct, throw an error
  if (!isPassswordCorrect) {
    throw new apiError(401, "Invalid old password");
  }

  // Update the user's password with the new password
  user.password = newPassword;

  // Save the updated user
  await user.save({ validateBeforeSave: false });

  // Send a success response
  return res.status(200).json(new apiResponse(200, {}, "password changed"));
});

// JavaScript code for fetching the current user

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "current user fetched successfully"));
});

// This function is an asynchronous function wrapped in an asyncHandler.
const updateAccountDetails = asyncHandler(async (req, res) => {
  // It destructures 'fullname' and 'email' from the request body.
  const { fullname, email } = req.body;

  // If either 'email' or 'fullname' is not provided in the request, it throws an error.
  if (!email || !fullname) {
    throw new apiError(400, "All fields are required");
  }

  // It then updates the user's 'fullname' and 'email' in the database using the User's id from the request.
  // The 'new: true' option in findByIdAndUpdate means it will return the new updated document.
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    { new: true }
  ).select("-password"); // The 'select' function is used to exclude the password field from the result.

  // Finally, it sends a response with a status of 200 and a message of "Account details updated successfully".
  return res
    .status(200)
    .json(new apiResponse(200, user, "Account details updated successfully"));
});

// This is an asynchronous function to update the user's avatar.
const updateUserAvatar = asyncHandler(async (req, res) => {
  // Get the local path of the uploaded avatar file from the request.
  const avatarLocalPath = req.file?.path;

  // If the avatar file is not found in the request, throw an error.
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is missing");
  }

  // Upload the avatar file to Cloudinary and get the result.
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // If the avatar URL is not found in the result, throw an error.
  if (!avatar.url) {
    throw new apiError(400, "Error occured while uploading on avatar");
  }

  // Update the avatar URL of the user in the database and get the updated user.
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true } // This option ensures that the updated document is returned.
  ).select("-password"); // Exclude the password field from the result.

  // Return a successful response with the updated user.
  return res
    .status(200)
    .json(new apiResponse(200, { user }, "Avatar updated successfully"));
});

// This is an asynchronous function to update the user's cover image.
const updateUserCoverImage = asyncHandler(async (req, res) => {
  // Get the local path of the uploaded cover image file from the request.
  const coverImageLocalPath = req.file?.path;

  // If the cover image file is not found in the request, throw an error.
  if (!coverImageLocalPath) {
    throw new apiError(400, "cover image file is missing");
  }

  // Upload the cover image file to Cloudinary and get the result.
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // If the cover image URL is not found in the result, throw an error.
  if (!coverImage.url) {
    throw new apiError(400, "Error occured while uploading on coverImage");
  }

  // Update the cover image URL of the user in the database and get the updated user.
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true } // This option ensures that the updated document is returned.
  ).select("-password"); // Exclude the password field from the result.

  // Return a successful response with the updated user.
  return res
    .status(200)
    .json(new apiResponse(200, { user }, "coverImage updated successfully"));
});

// Export the functions to be used by other parts of the application
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
