import jwt from 'jsonwebtoken';

export const optionalAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return next();
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decode.userId;
        next();
    } catch (error) {
        // If token is invalid, just proceed as unauthenticated
        next();
    }
};
