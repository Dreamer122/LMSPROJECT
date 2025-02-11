const User=require("../Models/User");
const Profile=require("../Models/Profile");
const Course=require("../Models/Course");
const courseProgress=require("../Models/CourseProgress");
const {uploadImageToCloudinary}=require("../Utils/imageUploader")

// update profile

exports.updateProfile=async=>(req,res){
    try{
        // date fetch
        const {firstName="",lastName="",phone="",
            gender="",dateOfBirth="",about=""
        }=req.body

        const id=req.body.User

        //get user data
        const user=await User.findById(id);

        // update user data
        const updatedUser=await User.findByIdAndUpdate(id,{
            firstName,lastName,phone
        },{new:true})

        //update profile data
        const AD=await Profile.findById(user.additionalDetails);

        AD.gender=gender
        AD.dateOfBirth=dateOfBirth
        AD.about=about

        await AD.save();

        //  get all data
        const updatedUserDetails=await User.findById(id).
        populate("additionalDetails").exec();

        return res.status(204).json({
            success:false,
            message:"Profile updated successfully",
            data:updatedUserDetails        
        })


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error updating profile",
            error:error.message
            })

    }
}

// get ALL user details

// HW do this controller

// delete account
exports.deleteAccount=async(req,res)=>{
// id get 
try{
    const id=req.body.user

    // get user data
    const user=await User.findById(id);
    // delete user data
    // delete additional details
    await Profile.findByIdAndDelete(user.additionalDetails)

    // unenrolled courses
    for(let courseId of user.courses){
        await Course.findByIdAndUpdate(courseId,{
            $pull:{"studentsEnrolled":id}
        })
    }
// progress course delete
    await courseProgress.deleteMany(id)
    // delete userdata

    await User.findByIdAndDelete(id)
    return res.status(204).json({
        success:true,
        message:"Account deleted successfully"
        })


}
catch(error){
    return res.status(500).json({
        success:false,
        message:"Error deleting account",
        error:error.message
        })
}

}


// update display picture 
exports.updateDisplayPicture=async(req,res)=>{
    try{
        // get id
        const userId=req.user.id
        // get image 
        const imagefile=req.files.displayPicture

        // upload image
        const image=await uploadImageToCloudinary(imagefile,process.env.FOLDER_NAME,1000,1000)
        // update user data
        const updatedData=await User.findByIdAndUpdate({_id:userId},{
            image:image.secure_url
        },{new:true})

        return res.status(204).json({
            success:true,
            message:"Display picture updated successfully",
            data:updatedData
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error updating display picture",
            error:error.message
            })
    }
}
