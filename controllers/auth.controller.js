import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateJwtAndSetCookies } from "../utils/jwt.js";

export const signup = async (req, res) => {
  try {
 // input fields
    const {name,email,password} = req.body;
    
    // input validation check
    if(!name || !email ||!password){
        return res.status(400).json({
            success:false,message:"fill all required fields"
        })
    }
    // check if user exists
    const existingUser = await User.findOne({email})
    if (existingUser){
        return res.status(400).json({
            success:false,message:"user already exists"
        })  
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password,10)
    
    // create user
    const user = await User.create({
        name,
        email,
        password:hashedPassword
    })

    // save user details to database
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({success:false,message:error.message || "Internal server error"})
  }
};


export const login = async(req,res)=>{
  try { 
  // input fields
  const {email,password} = req.body; 
  
  // input validation check
  if(!email || ! password){
    return res.status(400).json({success:false,message:"fill all required fields"})
  }
  
  // user not existing
  const user = await User.findOne({email});
  if (!user){
    return res.status(404).json({success:false,message:"user not found"});
  }
  
  // check if credentials are valid
  const passwordMatch = await bcrypt.compare(password,user.password)
    if (!passwordMatch){
      return res.status(400).json({
        success:false,message:"invalid credentials"
      })
    }
    const token = generateJwtAndSetCookies(res,user._id);
    await user.save()
    res.status(200).json({success:true,message:"login successful",token:token,user:user})
  } catch (error) {
    res.status(500).json({success:false,message:error.message || "Internal server error"})
  }
}


export const logout = async(req,res) =>{
  try {
    res.clearCookie("token")
    res.status(200).json({success:true,message:"logout successful"})
  } catch (error) {
    res.status(500).json({success:false,message:error.message || "Internal server error"})
  }
}