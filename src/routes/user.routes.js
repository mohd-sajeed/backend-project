// Importing the Router class from the 'express' module
import { Router } from "express";

// Importing specific functions from the user.controller.js file
import { logoutUser, loginUser, registerUser ,refreshAccessToken} from "../controllers/user.controller.js";

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
router.route("/login").post(loginUser);

// Defining a secured route for user logout, with JWT verification middleware and logoutUser function
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken)

// Exporting the router instance as the default module export
export default router;
