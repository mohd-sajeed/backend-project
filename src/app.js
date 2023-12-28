// enter your javascript code here

import express from "express"; // Importing the express module
import cors from "cors"; // Importing the cors module
import cookieParser from "cookie-parser"; // Importing the cookie-parser module

// Create an instance of Express
const app = express(); // Creating an instance of the Express application

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true })); // Using the cors middleware with specific options
app.use(express.json({ limit: "20kb" })); // Parsing incoming request bodies as JSON with a size limit of 20kb
app.use(express.urlencoded({ extended: true, limit: "20kb" })); // Parsing incoming request bodies as URL-encoded data with a size limit of 20kb and extended option set to true
app.use(express.static("public")); // Serving static files from the 'public' directory
app.use(cookieParser()); // Using the cookie-parser middleware to parse cookies

// routes

import userRouter from "./routes/user.routes.js" // Importing userRouter from user.routes.js file

//routes declaration
app.use("/api/v1/users",userRouter) // Mounting the userRouter to handle requests for "/api/v1/users"

export default app; // Exporting the app instance as a default module export


 //http://localhost:8000/api/v1/users/login

