import { PrismaClient as PostgresClient } from '../../generated/postgres-client/index.js';
import { PrismaClient as MongoClient } from '../../generated/mongo-client/index.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';


export const pg = new PostgresClient();  // For User
export const mongo = new MongoClient();  // For Content & Comment

// create content
const createContent = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    const { title, body, type, status = "DRAFT" } = req.body;

    if (!title || !body || !type) {
        throw new ApiError(400, "All fields are required");
    }

    if (!userId) {
        throw new ApiError(401, "Unauthorized user")
    }

    const newContent = await mongo.content.create({
        data: {
            title,
            body,
            type,
            status,
            authorId: userId.toString()
        }
    })
    console.log(newContent)

    res.status(201).json(new ApiResponse(201, newContent, "content Created"))
})

// get all content
const getAllContent = asyncHandler(async (req, res) => {
  const { id, username } = req.params;

  const contents = await mongo.content.findMany({
    where: { authorId: id, username: username},
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json(new ApiResponse(200, contents, "All contents"));
});


// GET /api/v1/content
const getUserContent = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const contents = await mongo.content.findMany({
        where: {
            authorId: userId.toString()
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    res.status(200).json(new ApiResponse(200, contents, "User's content fetched"));
});


// get content by id
// GET /api/v1/content/:id
const getContentById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const content = await mongo.content.findUnique({ where: { id } });
    if (!content) throw new ApiError(404, "Content not found");

    const userIdNum = parseInt(content.authorId);
    if (isNaN(userIdNum)) {
        throw new ApiError(400, "Invalid authorId format");
    }

    const author = await pg.user.findUnique({
        where: { id: userIdNum },
        select: { id: true, username: true, fullName: true } // <-- replace `username` with actual field
    });

    res.status(200).json(new ApiResponse(200, { ...content, author }, "content found"));
});


// update content
const updateContent = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, body, type, status } = req.body;
    console.log({ id, title, body, type, status, userId });

    const existing = await mongo.content.findUnique({ where: { id } });
    if (!existing) {
        throw new ApiError(404, "Content not found");
    }

    const updated = await mongo.content.update({
        where: { id },
        data: {
            title,
            body,
            type,
            status,
            authorId: userId.toString()
        }
    });

    res.status(200).json(new ApiResponse(200, updated, "Content Updated"))
})

// Deleted Content
const deleteContent = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access to delete content");
    }

    const content = await mongo.content.findUnique({ where: { id } });

    if (!content) {
        throw new ApiError(404, "Content not found");
    }

    // Allow delete if user is admin OR content owner
    if (content.authorId.toString() !== userId.toString() && userRole !== "ADMIN") {
        throw new ApiError(403, "You are not allowed to delete this content");
    }

    await mongo.content.delete({ where: { id } });

    res.status(200).json(new ApiResponse(200, null, "Content Deleted"));
});



// likes from user
const toggleLike = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id.toString();

    const content = await mongo.content.findUnique({
        where: { id },
        select: { id: true, likes: true }
    });
    if (!content) throw new ApiError(404, "Content not found");

    const alreadyLiked = (content.likes || []).includes(userId);

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


// POST /api/v1/content/comment/:id

const addComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    const userIdFromToken = req.user?.id;  // PostgreSQL user ID like "15"
    if (!userIdFromToken) throw new ApiError(401, "Unauthorized user");

    if (!id || !text) throw new ApiError(400, "Missing content ID or text");

    // Create comment using PostgreSQL ID directly as a string
    const comment = await mongo.comment.create({
        data: {
            text,
            contentId: id,
            userId: String(userIdFromToken) // Treat it as string
        }
    });

    res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});




// get comments by id
// GET /api/v1/content/comments/:id 
const getComments = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Fetch all comments
    const comments = await mongo.comment.findMany({
        where: { contentId: id },
        orderBy: { createdAt: "desc" }
    });

    // 2. Get all unique userIds
    const userIds = [...new Set(comments.map(c => parseInt(c.userId)))];

    // 3. Fetch user info from PostgreSQL
    const users = await pg.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true } // replace with actual field
    });

    const userMap = {};
    users.forEach(user => userMap[user.id] = user);

    // 4. Merge user info into each comment
    const enriched = comments.map(comment => ({
        ...comment,
        user: userMap[parseInt(comment.userId)] || null
    }));

    res.status(200).json(new ApiResponse(200, enriched, "Comments fetched"));
});


// get all comments
const getCommentsGroupedByCategory = asyncHandler(async (req, res) => {
    const allComments = await mongo.comment.findMany({
        include: {
            content: {
                select: {
                    id: true,
                    type: true, // Assuming 'type' is the category like POEM/STORY
                    title: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    // Group by content type (category)
    const grouped = {};

    allComments.forEach(comment => {
        const category = comment.content?.type || "UNKNOWN";
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(comment);
    });

    res.status(200).json(new ApiResponse(200, grouped, "Comments grouped by category"));
});


// Delete comment
const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const comment = await mongo.comment.findUnique({
        where: { id },
    });

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // console.log("Logged in user ID:", req.user.id);
    // console.log("Comment user ID:", comment.userId);

    if (String(comment.userId) !== String(req.user.id)) {
        throw new ApiError(403, "You are not allowed to delete this comment");
    }

    await mongo.comment.delete({
        where: { id }
    });

    res.status(200).json(new ApiResponse(200, null, "Comment Deleted"));
});


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
    getUserContent,
    getContentById,
    updateContent,
    deleteContent,
    toggleLike,
    addComment,
    getComments,
    getCommentsGroupedByCategory,
    deleteComment,
    getFilteredContent
}