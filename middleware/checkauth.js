import { User } from "../models/user.model.js"

export const checkAuth = async(req,res,next)=>{
    try {
        const userValid = await User.findById(req.userId);
        if(!userValid){
        return res.status(403).json({ success: false, message: "Unauthorized" });
}
next();
} catch (error) {
 return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });   
}
}