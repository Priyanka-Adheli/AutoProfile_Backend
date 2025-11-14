//controller for creating a resume of user

import imageKit from "../config/imagekit.js";
import Resume from "../modules/Resume.js";
import fs from "fs";
//post - resumes/create

export const createResume = async(req,res) => {
    try{

        const userId = req.userId;
        const {title} = req.body;

        //create an new Resume

        const newResume = await Resume.create({userId,title});

        //return success message
        return res.status(201).json({message:"Resume created successfully",resume:newResume})
    }
    catch(error)
    {
       return res.status(400).json({message:error.message})
    }
}

//controller to delete resume

// delete resumes/delete
export const deleteResume = async(req,res)=>{
   try{

        const userId = req.userId;
        const {resumeId} = req.params;

        //finding the user resume by user id and resumeid
        await Resume.findOneAndDelete({userId,_id:resumeId});

        //return success message
        return res.status(200).json({message:"Resume deleted successfully"})
    }
    catch(error)
    {
       return res.status(400).json({message:error.message})
    }
}

//get user resume by id

//get - resumes/get/:id
export const getResumeById = async(req,res)=>{
    try{

        const userId = req.userId;
        const {resumeId} = req.params;

        //find the resume based on userId and resumeId
        const resume = await Resume.findOne({userId,_id:resumeId});

        if(!resume)
        {
            return res.status(400).json({message:"Resume not Found"})
        }

        //return success message

        resume.__v = undefined;
        resume.createdAt=undefined;
        resume.updatedAt=undefined
        return res.status(200).json({resume})
    }
    catch(error)
    {
       return res.status(400).json({message:error.message})
    }
}


//get the publicly available resume data by id
//get resumes/public/:id

export const getPublicResumeById = async(req,res)=>{
    try{
        const {resumeId} = req.params;

        const resume = await Resume.findOne({public:true,_id:resumeId});

        if(!resume)
        {
            return res.status(400).json({message:"Resume not Found"})
        }

        resume.__v = undefined;
        resume.createdAt=undefined;
        resume.updatedAt=undefined
        return res.status(200).json({resume})

    }
    catch(error)
    {
        return res.status(400).json({message:error.message})
    }
}

//controller to update the resume
//post - resumes/update

export const updateResume = async(req,res)=>{
    try{
        const userId = req.userId;

        const {resumeId,resumeData,removeBackground} = req.body;

        const image = req.file;

        let resumeDataCopy;
        if(typeof resumeData === 'string')
            resumeDataCopy = await JSON.parse(resumeData);
        else
            resumeDataCopy = structuredClone(resumeData);

        if(image)
        {
            const imageBufferData = fs.createReadStream(image.path)
            const response = await imageKit.files.upload({
            file: imageBufferData,
            fileName: 'resume.png',
            folder:'user-resumes',
            transformation:{
                pre:'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove':'')
            }
            });
            resumeDataCopy.personal_info.image = response.url
        }


        const resume = await Resume.findByIdAndUpdate({userId,_id:resumeId},resumeDataCopy,{
            new:true
        });

        return res.status(200).json({message:"Saved Successfully",resume})
    }
    catch(error)
    {

    }
}