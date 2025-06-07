import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  // if (!user) throw new Error("User object is undefined in generateAccessToken");
  return jwt.sign(
    {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};
