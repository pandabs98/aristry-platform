import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); 

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: process.env.MAIL_USER, // your Gmail address
//     clientId: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//   },
// });


export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS
  },
  tls: {
    rejectUnauthorized: false, 
  }
});


export const sendMail = async (to, subject, html) => {
  
  try {
    const info = await transporter.sendMail({
  from: '"Artistry" <no-reply@artistry.com>',
  to,
  subject,
  html
});

    console.log("✅ Preview URL:", nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error("❌ Email Error:", error);
    throw error;
  }
};
