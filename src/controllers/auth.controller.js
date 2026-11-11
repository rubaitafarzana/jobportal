const { sendEmail } = require("../helpers/sendEmail");
const UserModel = require("../model/user.model");
const apiResponse = require("../utils/apiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
exports.signupController = asyncHandler(async (req, res) => {
  let { name, email, password } = req.body;

  let existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    apiResponse(res, 409, "user already exists");
  } else {
    bcrypt.hash(password, 10, async function (err, hash) {
      if (err) {
        apiResponse(res, 500, err || "internal server error");
      } else {
        const otp = uuidv4().toString().substring(0, 4);
        let user = new UserModel({
          name,
          email,
          password: hash,
          otpExpire: Date.now() + 5 * 60 * 1000,
          otp,
        });
        await user.save();

        // setTimeout(async () => {
        //   user.otp = null;
        //   user.otpExpire = null;
        //   await user.save();
        // }, 120000);

        sendEmail(email, otp, name,"signup-otp");
        apiResponse(res, 201, "account created successful", user);
      }
    });
  }
});

exports.signinController = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  let existingUser = await UserModel.findOne({ email }).select("+password");
  if (!existingUser) {
    apiResponse(res, 404, "email not found");
  } else {
    bcrypt.compare(password, existingUser.password, function (err, result) {
      if (result) {
        let user = {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          isActive: existingUser.isActive,
          isVerified: existingUser.isVerified,
        };

        jwt.sign(
          { email: existingUser.email, id: existingUser._id },
          process.env.privateKey,
          { expiresIn: "5m" },
          function (err, token) {
            apiResponse(res, 200, "user login successful", { ...user, token });
          },
        );
      } else {
        apiResponse(res, 404, "invalid password");
      }
    });
  }
});

exports.otpVerifyController = asyncHandler(async (req, res) => {
  let { email, otp } = req.body;
  let user = await UserModel.findOne({ email });

  if (user.otp == otp) {
    if (user.otpExpire > new Date()) {
      user.otp = null;
      user.isVerified = true;

      await user.save();
      apiResponse(res, 200, "OTP Verify successful");
    } else {
      apiResponse(
        res,
        400,
        "The One-Time Password has expired. Please request a new one.",
      );
    }
  } else {
    apiResponse(res, 400, "otp not matched");
  }
});
exports.otpResendController = asyncHandler(async (req, res) => {
  let { email } = req.body;
  let existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    if (existingUser.otpExpire > new Date()) {
      apiResponse(res, 429, "OTP resend limit exceeded");
    } else {
      const otp = uuidv4().toString().substring(0, 4);
      ((existingUser.otpExpire = Date.now() + 2 * 60 * 1000),
        (existingUser.otp = otp));
      await existingUser.save();
      sendEmail(email, otp, existingUser.name, "resend-otp");

      apiResponse(res, 200, "resend otp send successful");
    }
  } else {
    apiResponse(res, 404, "user not found");
  }
});

exports.forgotPasswordController = asyncHandler(async (req, res) => {
  let { email } = req.body;

  let user = await UserModel.findOne({ email });

  if (user) {
    const otp = uuidv4().toString().substring(0, 4);
    user.otp = otp;
    user.otpExpire = Date.now() + 2 * 60 * 1000;

    await user.save();
    sendEmail(email, otp, user.name, "forgot-password");
    apiResponse(res, 200, "forgot password otp send successful");
  } else {
    apiResponse(res, 404, "No account found.");
  }
});

exports.resetPasswordController = asyncHandler(async (req, res) => {
  let { email, password, otp } = req.body;
  let user = await UserModel.findOne({ email });

  if (user) {
    if (user.otp == otp) {
      if (user.otpExpire > new Date()) {

       let hashpassword = await bcrypt.hash(password, 10)

        user.otp = null;
        user.password = hashpassword
        await user.save();
        apiResponse(res, 200, "OTP Verify successful");
      } else {
        apiResponse(
          res,
          400,
          "The One-Time Password has expired. Please request a new one.",
        );
      }
    } else {
      apiResponse(res, 400, "otp not matched");
    }
  } else {
    apiResponse(res, 404, "No account found.");
  }
});