
//to register the user

import User from "../modules/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Resume from "../modules/Resume.js";
import redisClient from "../config/redis.js";

const generateToken = (userId)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'1d'})

    return token;
}
//post - users/register
export const registerUser = async(req,res)=>{
    try{
        const {name,email,password} = req.body;

        //check if required field exists
        if(!name || !email || !password)
            return res.status(400).json({message:"Missing required fields"});

        //check if email id already exits
        const user = await User.findOne({email});

        if(user)
        {
            return res.status(400).json({message:"User already exists"})
        }

        const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;


        if (!passwordRegex.test(password)) {
          return res.status(400).json({
            message:
              "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
          });
        }

        //create an new user
        const hashedPassword = await bcrypt.hash(password,10)

        const newUser = await User.create({
            name,email,password:hashedPassword
        });

        //return success msg and return the token
        const token = generateToken(newUser._id);

        //Set the token 
        res.cookie("token",token,{
          httpOnly:true,
          // secure:process.env.NODE_ENV=="production",
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge:24*60*60*1000
        });

        newUser.password = undefined;
        return res.status(201).json({
            message:"User created Successfully",
            // token,
            user:newUser
        })
    }
    catch(error)
    {
        return res.status(400).json({message:error.message})
    }
}

//post - users/login
//Method to login

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    //Set the token 
        res.cookie("token",token,{
          httpOnly:true,
          // secure:process.env.NODE_ENV=="production",
          secure: process.env.NODE_ENV === "production" ? true : false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge:24*60*60*1000
        });
    user.password = undefined;

    return res.status(200).json({
      message: "Login successful",
      // token,
      user,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


export const logoutUser = async(req,res)=>{
  try{
         const token = req.cookies.token;

          if (!token) {
            return res.status(400).json({ message: "No token found" });
          }
          // decode to get expiration
            const decoded = jwt.decode(token);
            const exp = decoded?.exp;

            // Store token in Redis blacklist until it expires
            await redisClient.set(`blacklist:${token}`, "true", {
              EX: exp - Math.floor(Date.now() / 1000), // seconds until expiry
            });
      res.clearCookie("token", {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production",
        });
      res.status(200).json({ message: "Logged out successfully" });
  }
  catch(error)
  {
    console.log(error.message);
  }
}
//controller to get userInfo by id

//get - users/info
export const getUserById = async(req,res)=>{
     try{
        const userId = req.userId;

        const user = await User.findById(userId);

        if(!user)
        {
            return res.status(404).json({message:"User not found"})
        }

        user.password = undefined;

        return res.status(201).json({
            user
        })
    }
    catch(error)
    {
        return res.status(400).json({message:error.message})
    }
}


//get - users/resumes
//to get the user resumes

export const getUserResumes = async(req,res)=>{
    try{
        const userId = req.userId;

        //return all user resumes

        const resumes =await Resume.find({userId});

        return res.status(200).json({resumes})
    }
    catch(error)
    {
        return res.status(400).json({message:error.message})
    }
}
