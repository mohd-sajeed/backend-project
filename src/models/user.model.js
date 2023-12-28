// Importing mongoose library and Schema from it
import mongoose, { Schema } from "mongoose";
// Importing bcrypt library for password hashing
import bcrypt from "bcrypt";
// Importing jsonwebtoken library for token generation
import jsonWebToken from "jsonwebtoken";

// Creating a new user schema using mongoose Schema class
const userSchema = new Schema(
  {
    // Defining username field with specific properties
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Defining email field with specific properties
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Defining fullname field with specific properties
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // Defining avatar field with specific properties (cloudinary url)
    avatar: {
      type: String, 
      required: true
    },
    // Defining coverImage field with specific properties (cloudinary url)
    coverImage: {
      type: String, 
    },
    
    // Defining watchHistory field as an array of references to 'Video' model
    watchHistory: [
       {
         type: Schema.Types.ObjectId, 
         ref:"Video"
       }
     ],
     // Defining password field with specific properties and error message if not provided
     password:{
       type:String, 
       required:[true,"Password is required"]
     },
     // Defining refreshToken field as a string
     refreshToken:{
       type:String
     }
  },

  {
   timestamps:true  // Adding timestamps to the schema (createdAt and updatedAt fields)
  }
);

// Pre save hook to hash the password before saving the user data into the database
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check if the entered password is correct or not by comparing it with hashed password in the database 
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password,this.password);
};

// Method to generate access token using user's information and secret key with expiration time 
userSchema.methods.generateAccessToken = function(){
 return jsonWebToken.sign({
   _id:this._id, 
   email:this.email, 
   username:this.username, 
   fullname:this.fullname},
   process.env.ACCESS_TOKEN_SECRETS,{
   expiresIn : process.env.ACCESS_TOKEN_EXPIRY});
};

// Method to generate refresh token using user's id and secret key with expiration time 
userSchema.methods.generateRefreshToken = function(){
 return jsonWebToken.sign({
   _id:this._id},
   process.env.REFRESH_TOKEN_SECRET,{
   expiresIn : process.env.REFRESH_TOKEN_EXPIRY});
};

// Exporting User model created using the user schema
export const User = mongoose.model("User", userSchema);
