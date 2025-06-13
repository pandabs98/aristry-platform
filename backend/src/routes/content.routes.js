import { Router } from "express";
import { 
    createContent,
    getAllContent, 
    getContentById, 
    updateContent, 
    deleteContent, 
    toggleLike, 
    addComment, 
    getComments, 
    getCommentsGroupedByCategory,
    deleteComment,
    getFilteredContent 
} from "../controllers/contentController.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// content Routes
router.route("/").post(verifyJWT, createContent).get(getAllContent);

// get filtered content
router.route("/getFilteredContent").get(getFilteredContent)

router.route("/all-comments").get(getCommentsGroupedByCategory); // get all comments

// get update and delete content routes
router.route("/:id").get(getContentById).put(verifyJWT, updateContent).delete(verifyJWT, deleteContent);

// likes
router.route("/:id/like").post(verifyJWT, toggleLike);

// comment routes
router.route("/comment/:id").post(verifyJWT, addComment)
router.route("/comment/:id").get(getComments);
// router.route("/all-comments").get(getCommentsGroupedByCategory);
router.route("/comment/:id").delete(verifyJWT, deleteComment) // delete comment


export default router