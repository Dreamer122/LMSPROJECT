const User=require("../Models/User");
const crs=require("crypto-random-string")
const bcrypt=require("bcrypt")
const {mailSender}=require("../Utils/mailSender")

exports.forgetPasswordToken=async()=>{
    try{
        const {email}=req.body;

        // validation
        if(!email) {
            return res.status(400).json({
                message:"Email is required"
            });
            }

            // user exists
            const user=await User.findOne({email:email});
            if(!user) {
                return res.status(404).json({
                    message:"User not found"
                    });
                }

            // generate random string 
            const token=cryptoRandomString({length: 15});

            // add token in user data
                const updatedData=User.findOneAndDelete({email},{
                    token:token,
                    tokenExpriresIn:Date.now()+5*60*1000
                },{new:true})

        const url = `http://localhost:5173/update-password/${token}`
                
        //  send mail

        await mailSender(email,
            "reset-password-link",
            `to reset password click on below url ${url}`)

// send response
return res.status(200).json({
    success:true,
    message:"Password reset link sent to your email"

})

            


    }
    catch(error){

        return res.status(500).json({
            success:false,
            message:"Internal server error error occured while sending mail for forgot password"
        })

    }
}

// create new password

exports.forgetPassword=async()=>
{
    try{
        const {password,confirmpassword,token}=req.body;

        // H/W do validation 
        // match password
        if(password!==confirmpassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm password does not match"
                })
                }

                 // check token is exprire or not 
                 const userdata=await User.find({token:token})
                 if(userdata.tokenExpriresIn < Date.now()){
                     return res.status(400).json({
                         success:false,
                         message:"token is expire"
                     })
                 }
            
                // hashed password
                const hashedPassword=await bcrypt.hash(password,10);


                // updated password in db
                const updatedPassword=await User.findOneAndUpdate({token:token},{password:hashedPassword})

                return res.status(200).json({
                    success:true,
                    message:"Password updated successfully"
                })




    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"error occured in updating password"+error.message
        })

    }
}