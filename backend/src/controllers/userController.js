import bcrypt from "bcrypt";
import crypto from "crypto"
import { PrismaClient } from "../../generated/postgres-client/index.js";
import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { sendMail } from "../utils/nodemailer.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import uploadOnCloudinary from "../utils/clodinary.js"
import { access } from "fs";


const prisma = new PrismaClient();


// Register user Api
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;
    // console.log("Files uploaded:", req.files);


    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();


    if (
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: normalizedEmail }, { username: normalizedUsername }
            ]
        }
    })
    // For testing is user already exit or not
    // console.log(existingUser) 
    // const users = await prisma.user.findMany(); 
    // console.log("All users:", users);

    if (existingUser) {
        throw new ApiError(409, "User Already exists with this email or username")
    }

    const avatarLocalPath = req?.files?.avatar?.[0]?.path
    const coverImageLocalPath = req?.files?.coverImage?.[0]?.path || "";


    if (!avatarLocalPath) {
        throw new ApiError(500, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(500,"Avatar file is required")
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");


    // Create new user
    const newUser = await prisma.user.create({
        data: {
            fullName,
            username,
            email,
            password: hashedPassword,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            isAdmin: false,
            isVerified: false,
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

// Login user Api
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email required")
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [{ email: email?.toLowerCase().trim() }, { username: username?.toLowerCase().trim() }

            ]
        }
    })

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }

    // token import
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);


    // Save refresh token to db
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });


    await sendMail(
        user.email,
        "Successfully Logged IN",
        `<h2>Hello Welcome ${user.fullName},</h2>
     <p>We love to see you again :</p>
     <a >Login successfully</a>
     <br><br>
     <p>This login is not done by you then contact immediately to Artistry team.</p>`
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 3 * 24 * 60 * 60 * 1000
    });


    return res.status(200).json(
        new ApiResponse(200, {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            accessToken,
            refreshToken
        }, "User Logged in Successfully")
    )
})

// Logout user Api
const logOut = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }
    })

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(
        new ApiResponse(200, null, "User Logged Out Successfully")
    )
})

// Change user password Api
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confPassword } = req.body;

    if (!(newPassword === confPassword)) {
        throw new ApiError(409, "Password doesn't match")
    }

    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });

    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old Password")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
    });


    return res.status(200).json(new ApiResponse(200, {}, "password Changed Successfully"))
})

// Get current user Api
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})


// Get account details api
const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All Fields are required")
    }
    const user = await prisma.user.findUnique({ where: { id: req.user?.id, } 
    });

    if(!user){
        throw new ApiError(404, "User not found")
    }
    const updateUser = await prisma.user.update({
        where:{id:req.user.id},
        data:{
            fullName,
            email:email.toLowerCase().trim()
        },
        select:{
            id:true,
            fullName: true,
            email:true,
            username:true,
            isAdmin:true,
            avatar:true
        }
    })
    return res.status(200).json(
        new ApiResponse(200, updateUser, "user details updated successfully")
    )
})

// update Avatar 
const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req?.files?.avatar?.[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar?.url){
        throw new ApiError(400,"Error while uploading on Avatar")
    }

    const user = await prisma.user.findUnique({
        where:{
            id:req.user.id
        }
    });

    if(!user){
        throw new ApiError(404, "User not Found")
    };

    const updatedUser = await prisma.user.update({
        where:{
            id:req.user.id
        },
        data:{
            avatar: avatar.url
        },
        select:{
            id:true,
            fullName:true,
            email:true,
            avatar:true,
            username:true
        }
    })

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Avaatar updated Successfully")
    )
})

// update CoverImage 
const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req?.files?.coverImage?.[0]?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage?.url){
        throw new ApiError(400,"Error while uploading on coverImage")
    }

    const user = await prisma.user.findUnique({
        where:{
            id:req.user.id
        }
    });

    if(!user){
        throw new ApiError(404, "User not Found")
    };

    const updatedUser = await prisma.user.update({
        where:{
            id:req.user.id
        },
        data:{
            coverImage: coverImage.url
        },
        select:{
            id:true,
            fullName:true,
            email:true,
            avatar:true,
            coverImage:true,
            username:true
        }
    })

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "CoverImage updated Successfully")
    )
})

// Deleted user
const deleteUser = asyncHandler(async(req,res)=>{
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
        where:{id:userId}
    });

    if(!user){
        throw new ApiError(404, "User not found");
    }

    await prisma.user.delete({
        where:{id:userId},
        data:{
            fullName:"Deleted User",
            email: `deleted-${Date.now()}@noemail.com`,
            avatar:null,
            coverImage:null,
            isDeleted:true,
            username: `deletedUser_${Date.now()}`
        }
    });

    await prisma.novel.updateMany({
        where:{created:userId},
        data:{
            authorized: "Unkown",
            createdBy: null, 
            isDeletedAuthor: true
        }
    })

    // clear Cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(
        new ApiResponse(200, null, "User account deleted successfully")
    )
})


// All exports
export {
    registerUser,
    loginUser,
    logOut,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    deleteUser
}