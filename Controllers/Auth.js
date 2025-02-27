const User=require("../Models/User");
const OTP=require("../Models/OTP");
const bcrypt=require("bcrypt")
const Profile=require("../Models/Profile")
const otpGenerator = require('otp-generator')
const jwt=require("jsonwebtoken")

// signup

exports.SignUp=async (req,res)=>{
    try{
        // data 
        const {firstName,lastName,password,email,phone,accountType,confirmPassword,otp}=req.body;

        // validation
        if(!firstName || !lastName || !password || !email || !phone || !accountType || !confirmPassword || !otp){
            return res.status(400).json({
                success:false,
                message:"Please fill all the fields",
                
            });
        }
        // check if email already exists
        const userExist=await User.findOne({email});
        if(userExist){
            return res.status(400).json({
                success:false,
                message:"Email already exists",
            })
        }

        // match password and confirm password
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm password do not match",
                })
                }

                // hashed password
                const hashedpassword=await bcrypt.hash(password,10);

                // match otp 

                const result=await OTP.find({email}).sort({createdAt:-1}).limit(1);
                console.log("length=",result.length)
                if(result.length==0){
                    return res.status(400).json({
                        success:false,
                    message:"Invalid OTP not found",
                        })
                }
                else if(result[0].otp!==otp){
                    return res.status(400).json({
                        success:false,
                        message:"Invalid OTP",
                        })
                }


                // create additional details 
                const additionalDetails= await new Profile({
                    gender:null,
                    dateOfBirth:null,
                    about:null
                }).save()

                // create user
    let approved = ""
    approved === "Instructor" ? (approved = false) : (approved = true)

                const user=new User({
                    firstName,
                    lastName,
                    password:hashedpassword,
                    email,
                    phone,
                    accountType,
                    additionalDetails:additionalDetails._id,
                    image:`https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`
                    }).save();

                    // send response
                  return  res.status(201).json({
                        success:true,
                        message:"User created successfully",
                        user:user
                        })

    }
    catch(error){

      return  res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })

    }
}

// otp controllers

exports.sendOTP=async(req,res)=>{
    try{
        const {email}=req.body
        // validation
        if(!email){
            return res.status(400).json({
                success:false,
                message:"Email is required"
                })
                }

                // generate otp
                const result=otpGenerator.generate(6,{
                    upperCaseAlphabets: false,
                     specialChars: false,
                     lowerCaseAlphabets:false
                })
                // save otp in db
             const otpdoc=  new OTP({
                email,
                otp:result

               }).save()

             return  res.status(201).json({
                success:true,
                message:"OTP sent successfully",
                otp:result
               })

    }
    catch(error){
       return res.status(500).json({
            success:false,
            message:"error occcured while creating otp ",
            error:error.message
            })

    }
}

// login 

exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body
        // validation
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Email and password are required"
                })
        }
        // user exist or not 
        const user=await User.findOne({email}).populate("additionalDetails")
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
                })
             }

             // password compare
             const isMatch=await bcrypt.compare(password,user.password)
             if(!isMatch){
                return res.status(400).json({
                    success:false,
                    message:"Invalid password"
                    })
             }
             else{

                // token generate 
                const token=jwt.sign({email:user.email,id:user._id,accountType:user.accountType},
                    process.env.JWT_SECRET,
                    {expiresIn:"24h"}
                )

                // create cookies
                const options={
                    httpOnly:true,
                    expires:new Date(Date.now()+3*24*60*60*1000),
                }

                user.token=token
                user.password=undefined

               return res.cookie("token",token,options).status(200).json({
                success:true,
                message:"Login Successfull",
                token:token,
                user,

               })

             }

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message +"login failure please try again later "
            
        })

    }
}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
    try {
      // Get user data from req.user
      const userDetails = await User.findById(req.user.id)
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body
  
      // Validate old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Update password
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      // Return success response
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
  }