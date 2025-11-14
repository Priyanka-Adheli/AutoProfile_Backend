// import jwt from "jsonwebtoken";
// const protect = async(req,res,next)=>{
//     // const token = req.headers.authorization;
//     const token = req.cookies.token;

//     if(!token)
//     {
//         return res.status(401).json({message: "Token Doesnt Exists"});
//     }

//     try{
//         const decoded = jwt.verify(token,process.env.JWT_SECRET);

//         req.userId = decoded.userId;

//         next();
//     }
//     catch(error)
//     {
//         return res.status(401).json({message:"Unauthorized"});
//     }
// }

// export default protect;


import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Token doesn't exist" });
    }

    // 🚨 Check Redis blacklist
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token is invalid (logged out)" });
    }

    // Verify JWT normally
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
export default protect;