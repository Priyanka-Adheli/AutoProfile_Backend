import mongoose from "mongoose";

const connectDB = async()=>{
    try{
        mongoose.connection.on("connected",()=>{
            console.log("Database connected successfully!!")
        })

        let mongodbUrl = process.env.MONGODB_URI;

        const projectName = "resume-builder";

        if(!mongodbUrl)
            throw new Error("MONGODB_URI ENV variables not set")

        if(mongodbUrl.endsWith("/"))
            mongodbUrl= mongodbUrl.slice(0,-1);

        await mongoose.connect(`${mongodbUrl}/${projectName}`);
    }
    catch(error)
    {
        console.log("Error connecting to MOngoDB",error);
    }
}
export default connectDB;