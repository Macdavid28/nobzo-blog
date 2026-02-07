import express from 'express';
import { createPost, getPosts, getPostBySlug, updatePost, deletePost } from '../controllers/post.controller.js';
import { verifyToken } from '../middleware/verifytoken.js';
import { checkAuth } from '../middleware/checkauth.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
export const postRoutes = express.Router();

postRoutes.post('/',verifyToken,checkAuth, createPost);
postRoutes.get('/', optionalAuth, getPosts); 
postRoutes.get('/:slug', optionalAuth, getPostBySlug);
postRoutes.put('/:id', verifyToken, checkAuth, updatePost);
postRoutes.delete('/:id', verifyToken, checkAuth, deletePost);

