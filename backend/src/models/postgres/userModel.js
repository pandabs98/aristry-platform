import {PrismaClient} from "../../../generated/postgres-client/index.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const createUser = async (userData)=>{
    const{
        fullName,
        username,
        email,
        password,
        avatar,
        coverimage = "",
        isAdmin = false,
    }= userData;

    const hashedPassword = await bcrypt.hash(password,10);

    return await prisma.user.create({
        data:{
            fullName,
            username,
            email,
            password:hashedPassword,
            avatar,
            coverimage,
            isAdmin
        }
    })
};

export const findUserByEmail = async (email)=>{
    return await prisma.user.findUnique({where:{email}});
}

export const findUserByUsername = async(username)=>{
    return await prisma.user.findUnique({where:{username}})
}

// compare password
export const isPasswordCorrect = async(entered, stored)=>{
    return await bcrypt.compare(entered, stored)
};

export const generateAccessToken = (user)=>{
    return jwt.sign(
        {
            id:user.id,
            fullName:user.fullName,
            username: user.username,
            email:user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiriesIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}


export const generateRefreshToken = (user)=>{
    return jwt.sign(
        {id:user.id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}