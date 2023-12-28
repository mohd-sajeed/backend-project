// Importing the required modules for the code
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Defining the schema for the video data
const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, //cloudinary url
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId, // Reference to the User schema
      ref: "User",
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields to the document
  }
);

// Adding pagination support to the video schema using mongoose-aggregate-paginate-v2 plugin
videoSchema.plugin(mongooseAggregatePaginate)

// Exporting the Video model based on the defined schema
export const Video = mongoose.model("Video", videoSchema);
