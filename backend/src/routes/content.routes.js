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
    deleteComment,
    getFilteredContent 
} from "../controllers/contentController";

const router = Router();

// content Routes
router.route("/").post(createContent).get(getAllContent);

// get filtered content
router.route("/getFilteredContent").get(getFilteredContent)

// get update and delete content routes
router.route("/:id").get(getContentById).put(updateContent).delete(deleteContent);

// likes
router.route("/:id/like").post(toggleLike);

// comment routes
router.route("/:id/comment").post(addComment).get(getComments);
router.route("/comment/:id").delete(deleteComment) // delete comment


export {router}