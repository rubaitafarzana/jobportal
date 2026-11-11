const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailTemplates = {
  "signup-otp": {
    subject: "Verify Your Email - Job Board",
    title: "Verify Your Email",
    message: "Thank you for creating an account. Use the OTP below to verify your email address.",
  },

  "resend-otp": {
    subject: "Resend OTP - Job Board",
    title: "Your New Verification OTP",
    message: "You requested a new OTP. Please use the OTP below to verify your email address.",
  },

  "forgot-password": {
    subject: "Reset Your Password - Job Board",
    title: "Forgot Password Verification",
    message: "We received a request to reset your password. Use the OTP below to continue.",
  },
};

exports.sendEmail = async (email, otp, name, otptype) => {
  try {
    const template = emailTemplates[otptype];

    if (!template) {
      throw new Error("Invalid OTP email type");
    }

    const html = `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        padding: 25px;
        color: #333;
        border: 1px solid #eee;
        border-radius: 10px;
      ">
        <h2 style="color: #2563eb;">
          ${template.title}
        </h2>

        <p>Hello ${name || "User"},</p>

        <p>${template.message}</p>

        <h1 style="
          background: #f1f5f9;
          color: #2563eb;
          text-align: center;
          padding: 15px;
          letter-spacing: 8px;
          border-radius: 8px;
        ">
          ${otp}
        </h1>

        <p>This OTP expires in 5 minutes.</p>

        <p>Never share your OTP with anyone.</p>

        <p>Regards,<br />
        <strong>Job Board Team</strong></p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Job Board" <${process.env.SMTP_USER}>`,
      to: email,
      subject: template.subject,
      html,
    });

    console.log("Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };

  } catch (error) {
    console.error("Email sending error:", error);

    throw new Error("Failed to send email");
  }
};