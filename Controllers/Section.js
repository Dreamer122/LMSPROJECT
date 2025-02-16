const Section=require("../Models/Section")
const Course=require("../Models/Course");

exports.createSection=async(req,res)=>{
    try{
        // get data
        const{sectionName,courseId}=req.body

        // validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Please fill all fields"
            })
            }

            

        // create section
        const section=await Section.create({
            sectionName,})

        // add section to course
        const updatedCourseDetails=await Course.findByIdAndUpdate(courseId,{
            $push:{courseContent:section._id}
        },{new:true}).populate("courseContent").exec();

        res.status(201).json({
            success:true,
            message:"Section created successfully",
            course:updatedCourseDetails
            })
    }
    catch(error){
        console.log(error);

    }
}