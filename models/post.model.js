import mongoose, { Mongoose } from "mongoose";

const postSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique:true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
  },
  tags:{
    type:[String],
    required:true
  },
  status:{
    type:String,
    enum:["draft","published"],
    default:"draft"
  },
  deletedAt: {
    type: Date,
    default: null
  }
},
{ timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);