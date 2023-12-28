// enter your javascript code here

import { v2 as cloudinary } from "cloudinary"; // Importing the v2 module from cloudinary package
import fs from "fs"; // Importing the file system module

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Setting the cloud name from environment variables
  api_key: process.env.CLOUDINARY_API_KEY, // Setting the API key from environment variables
  api_secret: process.env.CLOUDINARY_API_SECRET, // Setting the API secret from environment variables
});

const uploadOnCloudinary = async (localFilePath) => { // Defining an asynchronous function to upload file on Cloudinary
  try {
    if (!localFilePath) return null; // If localFilePath is not provided, return null
    const response = await cloudinary.uploader.upload(localFilePath, { // Upload the file on Cloudinary
      resource_type: "auto", // Set resource type as auto
    });
    fs.unlinkSync(localFilePath); // Delete the local file after successful upload
    return response; // Return the response after successful upload
  } catch (error) {
    fs.unlinkSync(localFilePath); // Remove the locally saved temporary file if upload operation fails
    return null; // Return null if there's an error during upload
  }
};

export default uploadOnCloudinary; // Exporting the function to be used in other files


// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) {
//       console.error("No local file path specified.");
//       return null;
//     }

//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });

//     console.log("File is uploaded on Cloudinary", response.url);
//     return response;
//   } catch (error) {
//     console.error("Failed to upload file on Cloudinary:", error);
//     // Only unlink if the file exists
//     if (fs.existsSync(localFilePath)) {
//       fs.unlinkSync(localFilePath);
//     }
//     return null;
//   }
// };

// export default uploadOnCloudinary;
