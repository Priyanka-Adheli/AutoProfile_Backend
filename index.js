import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import resumeRouter from "./routes/ResumeRoute.js";
import aiRouter from "./routes/aiRoutes.js";
import cookieParser from "cookie-parser";
import redisClient from "./config/redis.js";
const app = express();

const PORT = process.env.port || 3000

//Database Connection

const connectionReady = async()=>{
    try{
    await redisClient.connect();
    await connectDB()
    }
    catch(error)
    {
        console.log(error.message);
    }
}

await connectionReady();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}));


app.get("/",(req,res)=>{
    res.send("Server is Live!!")
})

app.use('/users',userRouter);
app.use('/resumes',resumeRouter);
app.use('/ai',aiRouter);

app.listen(PORT,()=>{
    console.log(`Server is Running on port ${PORT}`);
})