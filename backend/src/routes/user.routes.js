import { Router } from "express";
import { 
    loginUser, 
    logOut, 
    registerUser, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateAvatar, 
    updateCoverImage,
    deleteUser,
} from "../controllers/userController.js";
import { upload } from "../midddleware/multer.middleware.js";
import { verifyJWT } from "../midddleware/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
]),
    registerUser
);
router.route("/login").post(loginUser)
router.post("/logout", verifyJWT, logOut)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.post(
  "/update-avatar",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  verifyJWT,
  updateAvatar
);

router.post(
  "/update-cover-image",
  upload.fields([{ name: "coverImage", maxCount: 1 }]),
  verifyJWT,
  updateCoverImage
);

router.route("/deleteUser").post(deleteUser)



export default router;