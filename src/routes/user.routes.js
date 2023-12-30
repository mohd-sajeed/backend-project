// Importing the Router class from the 'express' module
import { Router } from "express";

// Importing specific functions from the user.controller.js file
import {
  logoutUser,
  loginUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";

// Importing the 'upload' function from the multer.middleware.js file
import { upload } from "../middlewares/multer.middleware.js";

// Importing the 'verifyJWT' function from the auth.middleware.js file
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Creating a new instance of the Router class
const router = Router();

// Defining a route for user registration and specifying middleware for file uploads and registerUser function
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

// Defining a route for user login and specifying loginUser function to handle it
router
.route("/login")
.post(loginUser);

// Defining a secured route for user logout, with JWT verification middleware and logoutUser function
router
.route("/logout")
.post(verifyJWT, logoutUser);

// Define a POST route for '/refresh-token' that calls the 'refreshAccessToken' function when accessed
router
.route("/refresh-token")
.post(refreshAccessToken);

router.
route("/change-password")
.post(verifyJWT, changeCurrentPassword);

router
.route("/current-user")
.get(verifyJWT, getCurrentUser);

router
.route("/update-account")
.patch(verifyJWT, updateAccountDetails);

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router
.route("/channel/:username")
.get(verifyJWT, getUserChannelProfile);

router
.route("/history")
.get(verifyJWT, getWatchHistory);

// Exporting the router instance as the default module export
export default router;
