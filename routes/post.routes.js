import express from "express";
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";
import { checkAuth } from "../middleware/checkauth.js";
import { unAuth } from "../middleware/un-auth.js";
export const postRoutes = express.Router();

postRoutes.post("/", verifyToken, checkAuth, createPost);
postRoutes.get("/", unAuth, getPosts);
postRoutes.get("/:slug", unAuth, getPostBySlug);
postRoutes.put("/:id", verifyToken, updatePost);
postRoutes.delete("/:id", verifyToken, deletePost);
