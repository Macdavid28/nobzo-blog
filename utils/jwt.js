import jwt from 'jsonwebtoken';

export const generateJwtAndSetCookies = (res,userId)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"1d"});
    
    res.cookie("token",token,{
    httpOnly:true,
    sameSite:"strict",
    secure:process.env.NODE_ENV === "production",
    maxAge:24 * 60 * 60 * 1000,
});

return token;

}