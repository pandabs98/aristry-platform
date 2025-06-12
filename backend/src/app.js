import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from "helmet"


const app = express()
app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))
app.use(helmet())
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())




// Routes import
import userRouter from "./routes/user.routes.js";
import contentRouter from "./routes/content.routes.js"

// Routes decleration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/content", contentRouter)
app.get("/api/v1/users/test", (req, res) => {
  res.json({ success: true, message: "API working fine" });
});


app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});


// app.use((req, res, next) => {
//   res.status(404).json({ success: false, message: "Route not found" });
// });

export default app;