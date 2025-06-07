import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../generated/postgres-client/index.js";
import {asyncHandler} from "../utils/AsyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"
import { sendMail } from "../utils/nodemailer.js";
import crypto from "crypto"


const prisma = new PrismaClient();

const registerUser = asyncHandler (async (req,res)=>{
    const  {fullName, username, email, password} = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();


    if(
        [fullName, username, email, password].some((field)=>field?.trim() === "")
    ){
        throw new ApiError (400, "All fields are required");
    }

    const existingUser = await prisma.user.findFirst({
        where:{OR:[
            {email:normalizedEmail},{username:normalizedUsername}
        ]}
    })
    console.log(existingUser)
    const users = await prisma.user.findMany();
    console.log("All users:", users);

    if(existingUser){
        throw new ApiError (409, "User Already exists with this email or username")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverimage?.[0]?.path || "";


    if(!avatarLocalPath){
        throw new ApiError(500, "Avatar file is required")
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password,10);

    // generate verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    
    // Create new user
    const newUser =  await prisma.user.create({
            data:{
                fullName,
                username,
                email,
                password:hashedPassword,
                avatar:avatarLocalPath,
                coverImage:coverImageLocalPath,
                isAdmin:false,
                isVerified:false,
                emailVerificationToken
            }
        })


    const verificationLink = `http://localhost:5000/api/v1/users/verify/${emailVerificationToken}`

    await sendMail(
    newUser.email,
    "Verify your Artistry account",
    `<h2>Hello ${newUser.fullName},</h2>
     <p>Please click the link below to verify your account:</p>
     <a href="${verificationLink}">Verify Email</a>
     <br><br>
     <p>This link will expire in 24 hours.</p>`
  );

    return res.status(201).json(
        new ApiResponse(201, newUser, "User Register Successfully. Please Check your email to verify your account")
    )

});

    

export {
    registerUser,

}