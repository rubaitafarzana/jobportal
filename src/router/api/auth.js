const express = require("express");
const { signupController, signinController, otpVerifyController, forgotPasswordController, resetPasswordController, otpResendController } = require("../../controllers/auth.controller");
const router = express.Router()

// localhost:3000/api/auth/signup
router.post("/signup",signupController)
router.post("/signin",signinController)
router.post("/otp-verify",otpVerifyController)
router.post("/resend-otp", otpResendController);
router.post("/forgot-password",forgotPasswordController)
router.post("/reset-password", resetPasswordController)


module.exports = router;