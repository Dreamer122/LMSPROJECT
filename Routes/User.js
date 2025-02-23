// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required Controllers and middleware functions
const {
  login,
  SignUp,
  sendOTP,
  changePassword,
} = require("../Controllers/Auth")
const {
  forgetPasswordToken,
  forgetPassword,
} = require("../Controllers/ForgotPassword.js")

const { auth } = require("../Middleware/auth")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", SignUp)

// Route for sending OTP to the user's email
router.post("/sendotp", sendOTP)

// Route for Changing the password
router.post("/changepassword", auth, changePassword)

// ********************************************************************************************************
//                                      forget Password
// ********************************************************************************************************

// Route for generating a forget password token
router.post("/forget-password-token", forgetPasswordToken)

// Route for forgetting user's password after verification
router.post("/forget-password", forgetPassword)

// Export the router for use in the main application
module.exports = router