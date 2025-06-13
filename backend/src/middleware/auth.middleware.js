import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../generated/postgres-client/index.js";

const prisma = new PrismaClient();

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    console.log("Received token:", token);

    if (!token || typeof token !== "string") {
        throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid access token");
    }

    const user = await prisma.user.findUnique({
        where: { id: decodedToken?.id },
        select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            isAdmin: true,
            isVerified: true,
            avatar: true,
            coverImage: true
        }
    });

    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
});


