import { PrismaClient as PostgresClient } from '../../generated/postgres-client';
import { PrismaClient as MongoClient } from '../../generated/mongo-client';
import { asyncHandler } from '../utils/AsyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const pg = new PostgresClient();  // For User
export const mongo = new MongoClient();  // For Content & Comment

const createContent = asyncHandler(async (req, res) => {
    const { title, body, type, authorId } = req.body;

    if (!title || !body || !type || !authorId) {
        throw new ApiError(400, "All fields are required");
    }

    const newContent = await mongo.content.create({
        data: { title, body, type, authorId }
    })

    res.status(201).json(new ApiResponse(201, newContent, "content Created"))
})

// get all content
const getAllContent = asyncHandler(async (req, res) => {
    const contents = await mongo.content.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })
    res.status(200).json(new ApiResponse(200, contents, "All contents"))
})

// get content by id
const getContentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const content = await mongo.content.findUnique({ where: { id } });

    if (!content) throw new ApiError(404, "content not found")

    res.status(200).json(new ApiResponse(200, content, "content found"))
})

const updateContent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, body, status } = req.body;

    const updated = await mongo.content.update({
        where: { id },
        data: { title, body, status }
    });

    res.status(200).json(new ApiResponse(200, updated, "Content Updated"))
})

// Deleted Content
const deleteContent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await mongo.content.delete({ where: { id } })

    res.status(200).json(new ApiResponse(200, null, "Content Deleted"))
})


// likes from user
const toggleLike = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const content = await mongo.content.findUnique({ where: { id } });
    if (!content) throw new ApiError(404, "Content not found");

    const alreadyLiked = content.likes.includes(userId);

    const updated = await mongo.content.update({
        where: { id },
        data: {
            likes: alreadyLiked
                ? { set: content.likes.filter(uid => uid !== userId) }
                : { set: [...content.likes, userId] }
        }
    });

    res.status(200).json(new ApiResponse(200, updated, alreadyLiked ? "Like removed" : "Liked"));
});


// POST /api/v1/content/:id/comment
const addComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { text } = req.body;

    const comment = await mongo.comment.create({
        data: {
            text,
            contentId: id,
            userId
        }
    });

    res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});

// GET /api/v1/content/:id/comments
const getComments = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comments = await mongo.comment.findMany({
        where: { contentId: id },
        orderBy: { createdAt: "desc" }
    });

    res.status(200).json(new ApiResponse(200, comments, "Comments fetched"));
});

// Delete comment
const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const comment = await mongo.comment.findUnique({
        where: { id },
    })
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.userId !== req.user.id) {
        throw new ApiError(403, "You are not allowed to delete this comment");
    }


    await mongo.comment.delete({
        where: { id }
    });

    res.status(200).json(new ApiResponse(200, null, "Comment Deleted"))
})

// GET /api/v1/content?type=POEM
const getFilteredContent = asyncHandler(async (req, res) => {
    const { type } = req.query;

    const filtered = await mongo.content.findMany({
        where: { type },
        orderBy: { createdAt: "desc" }
    });

    res.status(200).json(new ApiResponse(200, filtered, `${type}s fetched`));
});


// Export 
export {
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
}