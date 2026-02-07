import jwt from 'jsonwebtoken'
export const verifyToken = async(req,res,next)=>{
    // fetch token from cookies
    const token = req.headers.authorization?.split(" ")[1]
    // token input check
    if (!token){
        return res.status(401).json({success:false,message: "Unauthorized - No Token Provided"})
    }
    try {
        // decode and verify token
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        // check if token is valid
        if(!decode){
            return res.status(401).json({success:false,message:"Unauthorized - invalid or expired token"})
        }
        // set decoded userId to the request id sent to the server
        req.userId = decode.userId;
        next();
    } catch (error) {
return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });   
}
}