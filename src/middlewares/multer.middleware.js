// Importing the 'multer' package for handling file uploads
import multer from "multer";

// Creating a storage engine using 'multer.diskStorage' method
const storage = multer.diskStorage({
  // Setting the destination for uploaded files
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  // Setting the filename for uploaded files
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
}); 

// Exporting a middleware that uses the 'multer' package with the defined storage engine
export const upload = multer({ storage, });
