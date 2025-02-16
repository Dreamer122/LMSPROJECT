const Course=require("../Models/Course")
const User=require("../Models/User")
const Category=require("../Models/Category")
const { uploadImageToCloudinary } = require("../Utils/imageUploader")



exports. createCourse=async(req,res)=>{
    try{

        // Get user ID from request object
    const userId = req.user.id
        // get data
        const {courseName,courseDescription,price,category,tag,
            whatYouWillLearn,instructions,status}=req.body
            const {thumbnail}=req.files;

            // validation
            if(!courseName||!courseDescription||!price||!category||!tag||!
                whatYouWillLearn||!instructions||!thumbnail){
                    return res.status(400).json({
                        sucsess:false,
                        message:"Please fill all fields"
                    })
                    }

                    // make status draft
                    if (!status || status === undefined) {
                        status = "Draft"
                      }
            

                    //    who is creating course 
                    // Check if the user is an instructor
    const instructorDetails = await User.findById(userId, {
        accountType: "Instructor",
      })
  
      if (!instructorDetails) {
        return res.status(404).json({
          success: false,
          message: "Instructor Details Not Found",
        })
      }

      // Check if the category given is valid
    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      })
    }

      // create url of thumbnail
 // Upload the Thumbnail to Cloudinary
 const thumbnailImage = await uploadImageToCloudinary(
    thumbnail,
    process.env.FOLDER_NAME
  )
  console.log(thumbnailImage)


                    // create course
                    const course=await Course.create({
                        courseName, courseDescription,
                        price,
                        category:categoryDetails,
                        tag,
                        whatYouWillLearn,
                        instructions,
                        thumbnail: thumbnailImage.secure_url,
                         status,
                         instructor:instructorDetails._id

                    })

                    res.status(201).json({
                        success:true,
                        message:"Course created successfully",
                        course
                    })


    }
    catch(error){
        res.status(500).json({
            success:false,
            message:error.message})
    }
}

