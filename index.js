import dotenv from "dotenv";
import express from "express";
import { connectDb } from "./config/connectdb.js";
import { authRoutes } from "./routes/auth.routes.js";
import { postRoutes } from "./routes/post.routes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.get("/",(req,res)=>res.send("Backend is running"))

app.use("/api/auth",authRoutes)
app.use("/api/posts",postRoutes)
app.listen(process.env.PORT || 5000, () => {
connectDb(),
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});