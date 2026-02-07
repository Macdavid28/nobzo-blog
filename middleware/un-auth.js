import jwt from "jsonwebtoken";

export const unAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
  } catch (error) {
    // ignore invalid token for public routes
  }

  next();
};
